"use client"

import { kyInstance } from "@/lib/ky"
import { useQuery } from "@tanstack/react-query"

export default function Page() {
  const query = useQuery({
    queryKey: ["fetch-user-details"],
    queryFn: () =>
      kyInstance.get(`/api/users/bekbdkaqjvw552yi/followers`).json(),
  })
  return (
    <div>
      USER PAGE
      <br />
      {JSON.stringify(query.data)}
    </div>
  )
}
