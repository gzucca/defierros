// import ImagesCarrousel from "@/common/ImagesCarrousel";
// import CarLoader from "@/common/Loader/CarLoader";
// import PostInfo from "@/common/PostInfo";
// import SideBar from "@/common/SideBar";
// import featuresArrayToText from "@/helpers/featuresArrayToText";
// import sortCommentsAndBids from "@/helpers/sortCommentsAndBids";
// import {
//   getAuction,
//   getRunningQueriesThunk,
//   useLazyGetAuctionQuery,
// } from "@/redux/api/apiSlice";
// import { wrapper } from "@/redux/store";
// import { postAuctionView } from "@/services/auction.services";
// import { socket } from "@/socket";
// import formattedDate from "@/utils/formattedDate";
// import { log } from "@/utils/log";

// import { useRouter } from "next/router";
// import { useEffect, useRef, useState } from "react";
// import dynamic from "next/dynamic";
// import { useDispatch, useSelector } from "react-redux";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { HiDocumentArrowDown } from "react-icons/hi2";

import { api } from "~/trpc/server";
import CountDownBar from "./_components/CountDownBar";

// const Responsive = dynamic(
//   () => {
//     return import("../../common/Responsive");
//   },
//   { ssr: false }
// );

// const CommentBoxLive = dynamic(
//   () => {
//     return import("@/components/auctions/CommentBoxLive");
//   },
//   { ssr: false }
// );

// const CountDownBar = dynamic(
//   () => {
//     return import("@/components/auctions/CountDownBar");
//   },
//   { ssr: false }
// );

export default async function AuctionPage({
  params,
}: {
  params: { carId: string };
}) {
  const { userId } = await auth();

  const user = userId
    ? await api.users.get.byClerkId({ clerkId: userId }).then((result) => {
        return result.value;
      })
    : undefined;

  const { carId } = params;

  const carResult = await api.cars.get.byId({ id: carId });

  if (!carResult.value) {
    return <div>Car not found</div>;
  }

  const car = carResult.value;

  // const seller = auction?.User;
  // const dispatch = useDispatch();
  // const router = useRouter();
  // const [getAuctionTrigger, getAuctionResult] =
  //   useLazyGetAuctionQuery(auctionId);
  // const { user, loading, error } = useSelector((state) => state.user);
  // const [currentBid, setCurrentBid] = useState(0);
  // const [currentEndTime, setCurrentEndTime] = useState("");
  // const [comments, setComments] = useState([]);
  // const [replies, setReplies] = useState([]);
  // const [containerHeight, setContainerHeight] = useState(0);
  // const [cardHeight, setCardHeight] = useState(0);
  // const containerRef = useRef(null);
  // const cardRef = useRef(null);

  // useEffect(() => {
  //   socket.emit("join_auction", auctionId);

  //   // Calculamos height para el sidebar
  //   const handleResize = () => {
  //     if (containerRef.current?.offsetHeight) {
  //       setContainerHeight(containerRef.current.offsetHeight);
  //     }
  //     if (cardRef.current?.offsetHeight) {
  //       setCardHeight(cardRef.current?.offsetHeight);
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     socket.emit("leave_auction", auctionId);
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [auctionId]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     if (
  //       containerRef.current?.offsetHeight &&
  //       cardRef.current?.offsetHeight &&
  //       containerHeight === 0 &&
  //       cardHeight === 0
  //     ) {
  //       setContainerHeight(containerRef.current.offsetHeight);
  //       setCardHeight(cardRef.current?.offsetHeight);
  //       clearInterval(timer);
  //     }
  //     if (containerHeight !== 0 && cardHeight !== 0) {
  //       clearInterval(timer);
  //     }
  //   }, 2000);

  //   if (containerHeight !== 0 && cardHeight !== 0) {
  //     clearInterval(timer);
  //   }
  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [cardHeight, containerHeight]);

  // useEffect(() => {
  //   setComments((prev) => [
  //     ...prev,
  //     ...sortCommentsAndBids(auction?.Comments, auction?.Bids),
  //   ]);
  //   // setViews(auction?.views);
  //   if (auction?.endTime) {
  //     setCurrentEndTime(auction.endTime);
  //   }
  //   if (auction?.Bids?.length > 0) {
  //     setCurrentBid(auction.Bids[auction.Bids.length - 1].ammount);
  //   } else {
  //     setCurrentBid(car?.startingPrice);
  //   }

  //   return () => {
  //     setCurrentBid([]);
  //     setCurrentEndTime("");
  //     setComments([]);
  //   };
  // }, [auction, car.startingPrice]);

  // useEffect(() => {
  //   function onReceiveBid(data) {
  //     log("bid recibida", data.ammount);
  //     setCurrentBid(data.ammount);
  //     setCurrentEndTime(data.Auction.endTime);
  //   }
  //   socket.on("receive_bid", onReceiveBid);
  //   return () => {
  //     socket.off("receive_bid", onReceiveBid);
  //   };
  // }, [currentBid]);

  // useEffect(() => {
  //   function onReceiveComment(data) {
  //     log("comment recibido", data);
  //     setComments((prev) => [...prev, data]);
  //   }
  //   socket.on("receive_comment", onReceiveComment);
  //   return () => {
  //     socket.off("receive_comment", onReceiveComment);
  //   };
  // }, [comments]);

  // useEffect(() => {
  //   function onReceiveReply(data) {
  //     log("reply recibido", data);
  //     setReplies((prev) => [...prev, data]);
  //   }
  //   socket.on("receive_reply", onReceiveReply);
  //   return () => {
  //     socket.off("receive_reply", onReceiveReply);
  //   };
  // }, [replies]);

  // useEffect(() => {
  //   function onConnect() {
  //     log("reconectado", auctionId);
  //     getAuctionTrigger(auctionId);
  //     socket.emit("join_auction", auctionId);
  //   }
  //   socket.on("connect", onConnect);
  //   return () => {
  //     socket.off("connect", onConnect);
  //   };
  // }, [auctionId, getAuctionTrigger]);



  return (
    <>
      {/* <Script
        src="https://www.mercadopago.com/v2/security.js"
        strategy="afterInteractive"
        view="checkout"
        output="deviceId"
      /> */}

      <main className="text-primary mx-auto min-h-[70vh] max-w-[1400px]">
        {/* {!car && <CarLoader />} */}

        <>
          {/* <ImagesCarrousel
              id="imagesCarrousel"
              imagesArray={car.images}
              carModel={car.model}
            /> */}

          {car.images?.[0] && (
            <Image
              src={car.images[0]}
              alt={`${car.brand} ${car.model} ${car.year}`}
              width={1400}
              height={900}
              className="aspect-video h-auto w-full object-cover"
            />
          )}

          <CountDownBar
            className="sticky top-[68px] block lg:top-[76.8px]"
            user={user}
            auction={car}
            currentBid={car.startingPrice}
            currentEndTime={car.endTime}
          />

          <section className="mx-4 my-4">
            <h1 className="font-oswaldFamily text-left text-2xl font-bold">
              {car.brand} {car.model} {car.year}
            </h1>
            {/* <p suppressHydrationWarning className="">
                {featuresArrayToText(car.highlights)}
              </p> */}
          </section>

          <div className="mx-auto lg:grid lg:grid-cols-[80%,_20%]">
            <div>
              <section className="flex flex-col md:me-6">
                <dl className="mx-1 grid grid-cols-[40%,_60%] leading-10 md:grid-cols-[20%,_30%,20%,_30%]">
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Marca
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.brand}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Modelo
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.model}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Año
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.year}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Kilometraje
                  </dt>
                  <dd
                    suppressHydrationWarning
                    className="flex items-center border-y border-e ps-2"
                  >
                    {car.kilometers.toLocaleString()}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Vendedor
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {/* {seller.userName} */}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Titular vende
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.ownerSelling ? "Sí" : "No"}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Motor
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.engine}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Transmisión
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.transmission}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Tracción
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.driveTrain}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Segmento
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.bodyType}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Color
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {car.color}
                  </dd>
                  <dt className="border-accent bg-background border-y border-e ps-2 font-semibold">
                    Tipo de vendedor
                  </dt>
                  <dd className="flex items-center border-y border-e ps-2">
                    {/* {seller.sellerType === "dealer"
                        ? "Consecionaria"
                        : "Particular privado"} */}
                  </dd>
                </dl>
                {/* <p
                    suppressHydrationWarning={true}
                    className="mx-auto mt-1 text-center text-xs text-gray-600 md:text-end md:text-base"
                  >
                    Esta subasta finaliza el{" "}
                    {formattedDate(currentEndTime).split(",")[0]} a las{" "}
                    {formattedDate(currentEndTime).split(",")[1]}
                  </p> */}
              </section>

              {car.equipment && (
                <section className="mx-2 border-b-[1px] py-6">
                  <h2 className="font-oswaldFamily mb-2 px-2 text-xl font-bold">
                    Equipamiento
                  </h2>
                  <ul className="text-primary list-disc ps-6 pe-1 text-[15px]">
                    {car.equipment}
                  </ul>
                </section>
              )}

              {car.modifications && (
                <section className="mx-2 border-b-[1px] py-6">
                  <h2 className="font-oswaldFamily mb-2 px-2 text-xl font-bold">
                    Modificaciones
                  </h2>
                  <ul className="text-primary list-disc ps-6 pe-1 text-[15px]">
                    {car.modifications}
                  </ul>
                </section>
              )}

              {car.knownFlaws && (
                <section className="mx-2 border-b-[1px] py-6">
                  <h2 className="font-oswaldFamily mb-2 px-2 text-xl font-bold">
                    Fallas conocidas
                  </h2>
                  <ul className="text-primary list-disc ps-6 pe-1 text-[15px]">
                    {car.knownFlaws}
                  </ul>
                </section>
              )}

              {car.services && (
                <section className="mx-2 border-b-[1px] py-6">
                  <h2 className="font-oswaldFamily mb-2 px-2 text-xl font-bold">
                    Historial de servicio reciente
                  </h2>
                  <ul className="text-primary list-disc ps-6 pe-1 text-[15px]">
                    {car.services}
                  </ul>
                </section>
              )}

              {car.addedItems && (
                <section className="mx-2 border-b-[1px] py-6">
                  <h2 className="font-oswaldFamily mb-2 px-2 text-xl font-bold">
                    Ítems incluidos en la venta
                  </h2>
                  <ul className="text-primary list-disc ps-6 pe-1 text-[15px]">
                    {car.addedItems}
                  </ul>
                </section>
              )}

              {(car.domain ?? car.inspection) && (
                <section className="mx-2 border-b-[1px] py-6">
                  <ul className="flex place-content-start gap-4">
                    {car.domain && (
                      <a href={car.domain.replace("http", "https")}>
                        <HiDocumentArrowDown className="text-primary mx-auto text-4xl md:text-5xl" />
                        <h2 className="font-oswaldFamily">
                          Informe de dominio
                        </h2>
                      </a>
                    )}
                    {car.inspection && (
                      <a href={car.inspection.replace("http", "https")}>
                        <HiDocumentArrowDown className="text-primary mx-auto text-4xl md:text-5xl" />
                        <h2 className="font-oswaldFamily">
                          Informe de Inspección
                        </h2>
                      </a>
                    )}
                  </ul>
                </section>
              )}

              {/* <PostInfo
                  price={currentBid}
                  seller={seller}
                  endDate={currentEndTime}
                  car={car}
                  postId={auctionId}
                  postViewFunction={postAuctionView}
                  socket={socket}
                  currentViews={auction.views}
                  postType={"auction"}
                  user={user}
                /> */}

              {/* <CommentBoxLive
                  comments={comments}
                  setComments={setComments}
                  replies={replies}
                  setReplies={setReplies}
                  socket={socket}
                  user={user}
                  auction={auction}
                /> */}
            </div>
            {/* <Responsive displayIn={["Laptop"]}>
                <SideBar
                  cardRef={cardRef}
                  carLines={
                    containerHeight !== 0 && cardHeight !== 0
                      ? Math.floor(containerHeight / (cardHeight + 24))
                      : 0
                  }
                />
              </Responsive> */}
          </div>
        </>
      </main>
    </>
  );
}
