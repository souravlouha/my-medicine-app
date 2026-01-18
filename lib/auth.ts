// আমরা সরাসরি রুট ডিরেক্টরি থেকে auth ইমপোর্ট করছি
import { auth } from "../auth"; 

export const currentUser = async () => {
  try {
    const session = await auth();
    return session?.user;
  } catch (error) {
    return null;
  }
};

export const currentRole = async () => {
  try {
    const session = await auth();
    return session?.user?.role;
  } catch (error) {
    return null;
  }
};