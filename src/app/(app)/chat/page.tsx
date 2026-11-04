import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { GeneralChatScreen } from "@/features/chat-general";

export default function ChatPage() {
  return (
    <Suspense fallback={<Skeleton variant="list" rows={6} />}>
      <GeneralChatScreen />
    </Suspense>
  );
}
