// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // এই লেআউটটি এখন শুধু 'children' পাস করবে। 
  // কোনো ডিজাইন বা সাইডবার এখানে থাকবে না, যাতে সাব-লেআউটগুলোর সাথে জট না পাকায়।
  return <>{children}</>;
}