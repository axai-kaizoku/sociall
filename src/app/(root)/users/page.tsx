"use client"

import { kyInstance } from "@/lib/ky"
import { useQuery } from "@tanstack/react-query"
import { fetchData1, fetchData2 } from "@/server/actions/userActions"
import {Suspense} from "react";

export default function Page() {
  const query = useQuery({
    queryKey: ["fetch-user-details"],
    queryFn: () => kyInstance.get(`/api/users/bekbdkaqjvw552yi/posts`).json(),
  })

  const firstData = useQuery({
    queryKey: ["fetch-1"],
    queryFn: () => fetchData1(10),
  })
  const secondData = useQuery({
    queryKey: ["fetch-2"],
    queryFn: () => fetchData2(100),
  })
  return (
      <Suspense fallback={<div>suspense</div>}>
    <div>
      USER PAGE
      <br />
      {/*{JSON.stringify(query.data)}*/}
      <div className={"flex w-80 h-40 justify-between gap-4 divide-x items-center"}>
        <div className={"flex-1/2 h-full"}>
          {firstData.status === "pending" ? (
            <p>1st Loading...</p>
          ) : (
            <pre>{JSON.stringify(firstData.data)}</pre>
          )}
        </div>
        <div className={"flex-1/2 h-full"}>
          {secondData.status === "pending" ? (
            <p>2nd Loading...</p>
          ) : (
            <pre>{JSON.stringify(secondData.data)}</pre>
          )}
        </div>
      </div>
    </div>
      </Suspense>

  )
}
