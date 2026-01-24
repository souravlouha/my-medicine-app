// File: app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth"; // আপনার auth.ts ফাইলটি যেখানে আছে

export const { GET, POST } = handlers;