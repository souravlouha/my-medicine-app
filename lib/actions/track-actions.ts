"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { headers } from "next/headers";

// =========================================================
// SHARED TYPES
// =========================================================

export interface TimelineEvent {
  id: string;
  event: string;
  actor: string;
  role: string;
  location: string;
  quantity: number;
  status: string;
  date: Date;
}

export interface TrackingResult {
  batchNumber: string;
  expDate: Date;
  mfgDate: Date;
  mrp: number;
  isRecalled: boolean;
  isExpired: boolean;
  unitId: string | null;
  unitType: string | null;
  unitStatus: string | null;
  product: {
    name: string;
    genericName: string | null;
    type: string;
    strength: string | null;
  };
  manufacturer: {
    name: string;
    address: string | null;
    licenseNo: string | null;
  };
  timeline: TimelineEvent[];
  currentHolders: { holder: string; role: string; stock: number }[];
}

// =========================================================
// VALIDATION SCHEMAS
// =========================================================

const trackingIdSchema = z.string().min(3).max(200).trim();

// =========================================================
// 1. RECORD MOVEMENT ACTION (Internal - called on shipment receipt / order delivery)
//    Creates a BatchMovement entry automatically.
// =========================================================

export async function recordMovementAction(params: {
  batchId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  quantity: number;
  location?: string;
  status?: string;
  parentMovementId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const {
    batchId,
    senderId,
    senderName,
    receiverId,
    receiverName,
    receiverRole,
    quantity,
    location,
    status = "DELIVERED",
    parentMovementId,
  } = params;

  if (!batchId || !senderId || !receiverId || quantity <= 0) {
    return { success: false, error: "Invalid movement parameters." };
  }

  try {
    const movement = await prisma.batchMovement.create({
      data: {
        batchId,
        senderId,
        receiverId,
        senderName,
        receiverName,
        role: receiverRole as any,
        quantity,
        status,
        location: location ?? null,
        parentId: parentMovementId ?? null,
      },
    });

    return { success: true, movementId: movement.id };
  } catch (error) {
    console.error("recordMovementAction error:", error);
    return { success: false, error: "Failed to record movement." };
  }
}

// =========================================================
// 2. GET TRACKING HISTORY ACTION (Internal + Public)
//    Returns full chronological timeline for batchNumber or uid.
// =========================================================

export async function getTrackingHistoryAction(
  query: string
): Promise<{ success: true; data: TrackingResult } | { success: false; error: string }> {
  const parsed = trackingIdSchema.safeParse(query);
  if (!parsed.success) {
    return { success: false, error: "Invalid tracking ID." };
  }

  const id = parsed.data;

  try {
    // Step 1: Resolve the query to a batch (try unit uid first, then batchNumber)
    let batchId: string | null = null;
    let unitInfo: { uid: string; type: string; status: string } | null = null;

    const unit = await prisma.unit.findUnique({
      where: { uid: id },
      select: { id: true, uid: true, type: true, status: true, batchId: true },
    });

    if (unit) {
      batchId = unit.batchId;
      unitInfo = { uid: unit.uid, type: unit.type, status: unit.status };
    } else {
      const batch = await prisma.batch.findUnique({
        where: { batchNumber: id },
        select: { id: true },
      });
      if (batch) batchId = batch.id;
    }

    if (!batchId) {
      return { success: false, error: "No record found for this ID." };
    }

    // Step 2: Fetch full batch data
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        product: {
          select: {
            name: true,
            genericName: true,
            type: true,
            strength: true,
          },
        },
        manufacturer: {
          select: {
            name: true,
            address: true,
            licenseNo: true,
          },
        },
        inventory: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
        movements: {
          orderBy: { createdAt: "asc" },
        },
        recalls: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
      },
    });

    if (!batch) {
      return { success: false, error: "Batch data not found." };
    }

    const isExpired = new Date() > batch.expDate;
    const isRecalled = batch.recalls.length > 0;

    // Step 3: Build timeline
    const timeline: TimelineEvent[] = [];

    // First entry: Manufactured
    timeline.push({
      id: `mfg-${batch.id}`,
      event: "Manufactured",
      actor: batch.manufacturer.name,
      role: "MANUFACTURER",
      location: batch.manufacturer.address ?? "Manufacturing Facility",
      quantity: batch.totalQuantity,
      status: "COMPLETED",
      date: batch.createdAt,
    });

    // Subsequent entries from BatchMovement
    for (const move of batch.movements) {
      timeline.push({
        id: move.id,
        event:
          move.role === "DISTRIBUTOR"
            ? "Received by Distributor"
            : move.role === "RETAILER"
            ? "Received by Retailer"
            : move.role === "CONSUMER"
            ? "Sold to Consumer"
            : `Transferred to ${move.receiverName}`,
        actor: move.receiverName,
        role: move.role,
        location: move.location ?? "N/A",
        quantity: move.quantity,
        status: move.status,
        date: move.createdAt,
      });
    }

    const currentHolders = batch.inventory.map((inv) => ({
      holder: inv.user.name,
      role: inv.user.role as string,
      stock: inv.currentStock,
    }));

    return {
      success: true,
      data: {
        batchNumber: batch.batchNumber,
        expDate: batch.expDate,
        mfgDate: batch.mfgDate,
        mrp: batch.mrp,
        isRecalled,
        isExpired,
        unitId: unitInfo?.uid ?? null,
        unitType: unitInfo?.type ?? null,
        unitStatus: unitInfo?.status ?? null,
        product: batch.product,
        manufacturer: batch.manufacturer,
        timeline,
        currentHolders,
      },
    };
  } catch (error) {
    console.error("getTrackingHistoryAction error:", error);
    return { success: false, error: "Failed to fetch tracking history." };
  }
}

// =========================================================
// 3. VERIFY MEDICINE ACTION (Public — no auth required)
//    Verifies QR/UID, checks expiry & recall, logs scan for fraud detection.
// =========================================================

const SUSPICIOUS_SCAN_THRESHOLD = 10; // 10 total scans OR 3+ scans from 3+ distinct IPs within 10 minutes

export async function verifyMedicineAction(
  scannedId: string,
  clientMeta?: { device?: string; location?: string }
): Promise<{ success: true; data: TrackingResult } | { success: false; error: string }> {
  const parsed = trackingIdSchema.safeParse(scannedId);
  if (!parsed.success) {
    return { success: false, error: "Invalid scan ID." };
  }

  const id = parsed.data;

  try {
    // Get caller IP from headers
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    // Resolve to a Unit (QR) or Batch
    const unit = await prisma.unit.findUnique({
      where: { uid: id },
      include: {
        batch: {
          include: {
            product: {
              select: {
                name: true,
                genericName: true,
                type: true,
                strength: true,
              },
            },
            manufacturer: {
              select: { name: true, address: true, licenseNo: true },
            },
            recalls: { where: { status: "ACTIVE" }, select: { id: true } },
            movements: { orderBy: { createdAt: "asc" } },
            inventory: {
              include: { user: { select: { name: true, role: true } } },
            },
          },
        },
        scans: {
          where: {
            scannedAt: {
              gte: new Date(Date.now() - 10 * 60 * 1000), // last 10 minutes
            },
          },
          select: { ipAddress: true },
        },
      },
    });

    if (unit) {
      const batch = unit.batch;
      const isExpired = new Date() > batch.expDate;
      const isRecalled = batch.recalls.length > 0;

      // Fraud detection: check for suspicious scan volume
      const recentIps = new Set(unit.scans.map((s) => s.ipAddress));
      const isSuspicious =
        unit.scans.length >= SUSPICIOUS_SCAN_THRESHOLD ||
        (unit.scans.length >= 3 && recentIps.size >= 3);

      // Log the scan (fire-and-forget style — non-blocking)
      prisma.scanHistory
        .create({
          data: {
            unitId: unit.id,
            ipAddress: ip,
            device: clientMeta?.device ?? null,
            location: clientMeta?.location ?? null,
            isSuspicious,
          },
        })
        .catch((e) => console.error("Scan log error:", e));

      // Build timeline
      const timeline: TimelineEvent[] = [
        {
          id: `mfg-${batch.id}`,
          event: "Manufactured",
          actor: batch.manufacturer.name,
          role: "MANUFACTURER",
          location: batch.manufacturer.address ?? "Manufacturing Facility",
          quantity: batch.totalQuantity,
          status: "COMPLETED",
          date: batch.createdAt,
        },
        ...batch.movements.map((move) => ({
          id: move.id,
          event:
            move.role === "DISTRIBUTOR"
              ? "Received by Distributor"
              : move.role === "RETAILER"
              ? "Received by Retailer"
              : move.role === "CONSUMER"
              ? "Sold to Consumer"
              : `Transferred to ${move.receiverName}`,
          actor: move.receiverName,
          role: move.role as string,
          location: move.location ?? "N/A",
          quantity: move.quantity,
          status: move.status,
          date: move.createdAt,
        })),
      ];

      return {
        success: true,
        data: {
          batchNumber: batch.batchNumber,
          expDate: batch.expDate,
          mfgDate: batch.mfgDate,
          mrp: batch.mrp,
          isRecalled,
          isExpired,
          unitId: unit.uid,
          unitType: unit.type,
          unitStatus: unit.status,
          product: batch.product,
          manufacturer: batch.manufacturer,
          timeline,
          currentHolders: batch.inventory.map((inv) => ({
            holder: inv.user.name,
            role: inv.user.role as string,
            stock: inv.currentStock,
          })),
        },
      };
    }

    // Fallback: try batch number
    const batchRecord = await prisma.batch.findUnique({
      where: { batchNumber: id },
      include: {
        product: {
          select: { name: true, genericName: true, type: true, strength: true },
        },
        manufacturer: {
          select: { name: true, address: true, licenseNo: true },
        },
        recalls: { where: { status: "ACTIVE" }, select: { id: true } },
        movements: { orderBy: { createdAt: "asc" } },
        inventory: {
          include: { user: { select: { name: true, role: true } } },
        },
      },
    });

    if (batchRecord) {
      const isExpired = new Date() > batchRecord.expDate;
      const isRecalled = batchRecord.recalls.length > 0;

      const timeline: TimelineEvent[] = [
        {
          id: `mfg-${batchRecord.id}`,
          event: "Manufactured",
          actor: batchRecord.manufacturer.name,
          role: "MANUFACTURER",
          location: batchRecord.manufacturer.address ?? "Manufacturing Facility",
          quantity: batchRecord.totalQuantity,
          status: "COMPLETED",
          date: batchRecord.createdAt,
        },
        ...batchRecord.movements.map((move) => ({
          id: move.id,
          event:
            move.role === "DISTRIBUTOR"
              ? "Received by Distributor"
              : move.role === "RETAILER"
              ? "Received by Retailer"
              : move.role === "CONSUMER"
              ? "Sold to Consumer"
              : `Transferred to ${move.receiverName}`,
          actor: move.receiverName,
          role: move.role as string,
          location: move.location ?? "N/A",
          quantity: move.quantity,
          status: move.status,
          date: move.createdAt,
        })),
      ];

      return {
        success: true,
        data: {
          batchNumber: batchRecord.batchNumber,
          expDate: batchRecord.expDate,
          mfgDate: batchRecord.mfgDate,
          mrp: batchRecord.mrp,
          isRecalled,
          isExpired,
          unitId: null,
          unitType: null,
          unitStatus: null,
          product: batchRecord.product,
          manufacturer: batchRecord.manufacturer,
          timeline,
          currentHolders: batchRecord.inventory.map((inv) => ({
            holder: inv.user.name,
            role: inv.user.role as string,
            stock: inv.currentStock,
          })),
        },
      };
    }

    return { success: false, error: "Product verification failed. This code is not in our system." };
  } catch (error) {
    console.error("verifyMedicineAction error:", error);
    return { success: false, error: "Internal server error. Please try again." };
  }
}

// =========================================================
// 4. LEGACY: getTrackingData (kept for backward compat with verify/[batchId] page)
// =========================================================
export async function getTrackingData(scannedId: string) {
  const result = await verifyMedicineAction(scannedId);
  if (!result.success) return result;

  const d = result.data;
  return {
    success: true,
    data: {
      type: d.unitType ?? "BATCH",
      batchNumber: d.batchNumber,
      expDate: d.expDate,
      mfgDate: d.mfgDate,
      mrp: d.mrp,
      isRecalled: d.isRecalled,
      unitId: d.unitId,
      product: d.product,
      manufacturer: d.manufacturer,
    },
  };
}

// =========================================================
// 5. LEGACY: trackMedicineAction (kept for internal dashboard use)
// =========================================================
export async function trackMedicineAction(query: string) {
  if (!query) return { success: false, error: "Please enter Batch ID or QR." };

  const result = await getTrackingHistoryAction(query);
  if (!result.success) return result;

  const d = result.data;
  return {
    success: true,
    data: {
      batchInfo: {
        batchNumber: d.batchNumber,
        expDate: d.expDate,
        mfgDate: d.mfgDate,
        mrp: d.mrp,
        product: d.product,
        manufacturer: d.manufacturer,
      },
      unitInfo: d.unitId ? { uid: d.unitId, type: d.unitType, status: d.unitStatus } : null,
      timeline: d.timeline.map((t) => ({
        id: t.id,
        from: t.actor,
        distributor: t.actor,
        role: t.role,
        quantity: t.quantity,
        status: t.status,
        location: t.location,
        date: t.date,
      })),
      holders: d.currentHolders,
    },
  };
}

// =========================================================
// 6. SUPPLY CHAIN TREE ACTION (Role-filtered)
//    Returns a hierarchical tree of who sent what to whom.
//    Each role only sees their own relevant supply chain.
// =========================================================

export interface SupplyChainNode {
  id: string;
  name: string;
  role: "MANUFACTURER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER";
  quantity: number;
  date: string;
  location: string | null;
  children: SupplyChainNode[];
  strips?: string[]; // Strip UIDs held by this entity
}

export interface SupplyChainTreeResult {
  batchNumber: string;
  product: {
    name: string;
    genericName: string | null;
    type: string;
    strength: string | null;
  };
  manufacturer: {
    name: string;
    address: string | null;
  };
  mfgDate: string;
  expDate: string;
  mrp: number;
  totalQuantity: number;
  isRecalled: boolean;
  isExpired: boolean;
  tree: SupplyChainNode;
}

export async function getSupplyChainTreeAction(
  batchNumber: string
): Promise<{ success: true; data: SupplyChainTreeResult } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to view supply chain." };
  }

  const parsed = trackingIdSchema.safeParse(batchNumber);
  if (!parsed.success) {
    return { success: false, error: "Invalid batch number." };
  }

  try {
    const userId = session.user.id;

    // Get fresh user from DB for accurate role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true },
    });

    if (!currentUser) {
      return { success: false, error: "User not found." };
    }

    const userRole = currentUser.role; // MANUFACTURER | DISTRIBUTOR | RETAILER

    // Resolve batch (try batchNumber first, then UID)
    let batch = await prisma.batch.findUnique({
      where: { batchNumber: parsed.data },
      include: {
        product: {
          select: { name: true, genericName: true, type: true, strength: true },
        },
        manufacturer: {
          select: { id: true, name: true, address: true },
        },
        movements: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            senderName: true,
            receiverName: true,
            role: true,
            quantity: true,
            status: true,
            location: true,
            createdAt: true,
            parentId: true,
          },
        },
        recalls: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
      },
    });

    // If not found by batchNumber, try as Unit UID
    if (!batch) {
      const unit = await prisma.unit.findUnique({
        where: { uid: parsed.data },
        select: { batchId: true },
      });
      if (unit) {
        batch = await prisma.batch.findUnique({
          where: { id: unit.batchId },
          include: {
            product: {
              select: { name: true, genericName: true, type: true, strength: true },
            },
            manufacturer: {
              select: { id: true, name: true, address: true },
            },
            movements: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                senderId: true,
                receiverId: true,
                senderName: true,
                receiverName: true,
                role: true,
                quantity: true,
                status: true,
                location: true,
                createdAt: true,
                parentId: true,
              },
            },
            recalls: {
              where: { status: "ACTIVE" },
              select: { id: true },
            },
          },
        });
      }
    }

    if (!batch) {
      return { success: false, error: "No batch found for this ID." };
    }

    const isExpired = new Date() > batch.expDate;
    const isRecalled = batch.recalls.length > 0;

    // ====== BUILD THE FULL TREE ======

    // Root = Manufacturer
    const fullTree: SupplyChainNode = {
      id: batch.manufacturer.id,
      name: batch.manufacturer.name,
      role: "MANUFACTURER",
      quantity: batch.totalQuantity,
      date: batch.createdAt.toISOString(),
      location: batch.manufacturer.address ?? null,
      children: [],
    };

    // Group movements by role
    const distributorMovements = batch.movements.filter((m) => m.role === "DISTRIBUTOR");
    const retailerMovements = batch.movements.filter((m) => m.role === "RETAILER");
    const consumerMovements = batch.movements.filter((m) => m.role === "CONSUMER");

    // Build distributor nodes
    const distributorNodes: Map<string, SupplyChainNode> = new Map();
    for (const dm of distributorMovements) {
      const key = dm.receiverId ?? dm.receiverName;
      const existing = distributorNodes.get(key);
      if (existing) {
        existing.quantity += dm.quantity;
      } else {
        distributorNodes.set(key, {
          id: dm.receiverId ?? dm.id,
          name: dm.receiverName,
          role: "DISTRIBUTOR",
          quantity: dm.quantity,
          date: dm.createdAt.toISOString(),
          location: dm.location ?? null,
          children: [],
        });
      }
    }

    // Build retailer children under their distributor sender
    for (const rm of retailerMovements) {
      const retailerNode: SupplyChainNode = {
        id: rm.receiverId ?? rm.id,
        name: rm.receiverName,
        role: "RETAILER",
        quantity: rm.quantity,
        date: rm.createdAt.toISOString(),
        location: rm.location ?? null,
        children: [],
      };

      // Add consumer sales under retailer
      const consumerSales = consumerMovements.filter(
        (cm) => cm.senderId === (rm.receiverId ?? "")
      );
      for (const cs of consumerSales) {
        retailerNode.children.push({
          id: cs.id,
          name: cs.receiverName || "Consumer",
          role: "CONSUMER",
          quantity: cs.quantity,
          date: cs.createdAt.toISOString(),
          location: cs.location ?? null,
          children: [],
        });
      }

      // Find which distributor sent to this retailer
      const parentDistKey = rm.senderId;
      const parentDist = distributorNodes.get(parentDistKey);
      if (parentDist) {
        // Check if same retailer already exists, merge quantities
        const existingRetailer = parentDist.children.find(
          (c) => c.id === retailerNode.id
        );
        if (existingRetailer) {
          existingRetailer.quantity += retailerNode.quantity;
          existingRetailer.children.push(...retailerNode.children);
        } else {
          parentDist.children.push(retailerNode);
        }
      } else {
        // Orphan retailer (direct from manufacturer perhaps) — attach to root
        fullTree.children.push(retailerNode);
      }
    }

    // Attach distributors to root
    for (const dNode of distributorNodes.values()) {
      fullTree.children.push(dNode);
    }

    // ====== STRIP-LEVEL TRACKING ======
    // Query all STRIP units for this batch, grouped by currentHandlerId
    const allStrips = await prisma.unit.findMany({
      where: { batchId: batch.id, type: "STRIP" },
      select: { uid: true, currentHandlerId: true },
      orderBy: { uid: "asc" },
    });

    // Group strips by handler
    const stripsByHandler = new Map<string, string[]>();
    for (const strip of allStrips) {
      const handler = strip.currentHandlerId || batch.manufacturer.id;
      const list = stripsByHandler.get(handler) || [];
      list.push(strip.uid);
      stripsByHandler.set(handler, list);
    }

    // Recursive function to assign strips to tree nodes
    function assignStrips(node: SupplyChainNode) {
      const nodeStrips = stripsByHandler.get(node.id);
      if (nodeStrips && nodeStrips.length > 0) {
        node.strips = nodeStrips;
      }
      for (const child of node.children) {
        assignStrips(child);
      }
    }
    assignStrips(fullTree);

    // ====== ROLE-BASED FILTERING ======
    let filteredTree: SupplyChainNode;

    if (userRole === "MANUFACTURER") {
      // Manufacturer sees ONLY their own batch tree
      if (batch.manufacturer.id !== userId) {
        return { success: false, error: "This batch does not belong to you." };
      }
      filteredTree = fullTree; // Full downstream visibility

    } else if (userRole === "DISTRIBUTOR") {
      // Distributor sees: manufacturer → themselves → their retailers
      // They can see if they get same medicine from multiple manufacturers
      // But cannot see other distributors

      const myDistNode = distributorNodes.get(userId);
      if (!myDistNode) {
        return {
          success: false,
          error: "You have no record of receiving this batch.",
        };
      }

      // Build: manufacturer → this distributor → their retailers
      filteredTree = {
        ...fullTree,
        children: [myDistNode],
      };

    } else if (userRole === "RETAILER") {
      // Retailer sees: manufacturer → ALL distributors who sent to them → themselves
      // A retailer can receive the same medicine from multiple distributors

      const myDistributorNodes: SupplyChainNode[] = [];

      for (const dNode of distributorNodes.values()) {
        const found = dNode.children.find((r) => r.id === userId);
        if (found) {
          // Include this distributor with only this retailer as child
          myDistributorNodes.push({
            ...dNode,
            children: [found],
          });
        }
      }

      // Also check direct (orphan) retailers on root
      const orphanRetailer = fullTree.children.find(
        (c) => c.id === userId && c.role === "RETAILER"
      ) ?? null;

      if (myDistributorNodes.length === 0 && !orphanRetailer) {
        return {
          success: false,
          error: "You have no record of receiving this batch.",
        };
      }

      const filteredChildren: SupplyChainNode[] = [...myDistributorNodes];
      if (orphanRetailer) {
        filteredChildren.push(orphanRetailer);
      }

      filteredTree = {
        ...fullTree,
        children: filteredChildren,
      };

    } else if (userRole === "ADMIN") {
      // Admin sees everything
      filteredTree = fullTree;
    } else {
      return { success: false, error: "Your role cannot access supply chain tracking." };
    }

    return {
      success: true,
      data: {
        batchNumber: batch.batchNumber,
        product: batch.product,
        manufacturer: {
          name: batch.manufacturer.name,
          address: batch.manufacturer.address,
        },
        mfgDate: batch.mfgDate.toISOString(),
        expDate: batch.expDate.toISOString(),
        mrp: batch.mrp,
        totalQuantity: batch.totalQuantity,
        isRecalled: batch.recalls.length > 0,
        isExpired,
        tree: filteredTree,
      },
    };
  } catch (error) {
    console.error("getSupplyChainTreeAction error:", error);
    return { success: false, error: "Failed to fetch supply chain data." };
  }
}
