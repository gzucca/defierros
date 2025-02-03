// import sortAuctionsAndSales from "@/helpers/sortAuctionsAndSales";
// import { useGetAuctionsQuery, useGetSalesQuery } from "@/redux/api/apiSlice";
// import Image from "next/image";
// import Link from "next/link";
// import { useMemo } from "react";

// const SideBar = ({ carLines, cardRef }) => {
//   const { data: auctions } = useGetAuctionsQuery();
//   const { data: sales } = useGetSalesQuery();
//   const recent = useMemo(() => {
//     if (auctions?.data && sales?.data) {
//       return sortAuctionsAndSales({
//         auctionsArray: auctions?.data,
//         salesArray: sales?.data,
//         sorting: "Próximos cierres sin finalizar",
//       });
//     }
//   }, [auctions, sales]);

//   return (
//     <aside
//       className={`hidden overflow-y-hidden border-l-2 ps-4 lg:flex lg:flex-col`}
//     >
//       <h3 className="mx-2 my-4 text-lg font-bold">Próximos cierres</h3>
//       {carLines === 0 ? (
//         <div
//           ref={cardRef}
//           className=" mb-6 aspect-video h-36 w-full overflow-hidden rounded-md  bg-gray-200 "
//         >
//           <div className="grid h-2/3 animate-pulse grid-cols-[70fr__30fr] gap-1">
//             <div className="h-full w-full bg-gray-50"></div>
//             <div className="grid  h-full grid-rows-2  gap-1 overflow-hidden ">
//               <div className="bg-gray-50"></div>
//               <div className="bg-gray-50"></div>
//             </div>
//           </div>
//           <div className="h-1/3 animate-pulse p-2">
//             <div className="mb-1 h-3 w-3/4 rounded bg-slate-500 "></div>
//             <div className="h-2 w-1/2 rounded bg-slate-400 "></div>
//           </div>
//         </div>
//       ) : (
//         recent?.slice(0, carLines)?.map(({ CarDetail }) => {
//           const { id, model, brand, images, year, AuctionId, SaleId } =
//             CarDetail;
//           return (
//             <Link
//               ref={cardRef}
//               href={AuctionId ? `/auctions/${AuctionId}` : `/sales/${SaleId}`}
//               className=" mb-6 aspect-video h-36 w-full overflow-hidden  rounded-md bg-gray-50  "
//               key={"sideBar" + model + id}
//             >
//               <div className="grid h-2/3 grid-cols-[70fr__30fr] gap-1">
//                 <Image
//                   key={images[0] + "key"}
//                   width={200}
//                   height={150}
//                   src={images[0]}
//                   alt={brand + model}
//                   className="h-full w-full overflow-hidden object-cover"
//                   priority={true}
//                   sizes="15vw"
//                 />

//                 <div className="grid h-full  grid-rows-2 gap-1 overflow-hidden ">
//                   <Image
//                     key={images[1] + "key"}
//                     width={100}
//                     height={50}
//                     src={images[1]}
//                     alt={brand + model}
//                     className="aspect-square h-full w-full object-cover"
//                     priority={true}
//                     sizes="5vw"
//                   />

//                   <Image
//                     key={images[2] + "key"}
//                     width={100}
//                     height={50}
//                     src={images[2]}
//                     alt={brand + model}
//                     className="aspect-square h-full w-full object-cover"
//                     priority={true}
//                     sizes="5vw"
//                   />
//                 </div>
//               </div>

//               <div className="h-1/3  px-1 py-1">
//                 <h4 className=" text-base font-semibold">
//                   {brand} {model}
//                 </h4>
//                 <p className=" text-sm ">Año {year}</p>
//               </div>
//             </Link>
//           );
//         })
//       )}
//     </aside>
//   );
// };

// export default SideBar;
