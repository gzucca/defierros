import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CarDetailForm from "@/components/dashboard/CarDetailForm";
import featuresArrayToText from "@/helpers/featuresArrayToText";
import { updateSale } from "@/redux/sale/saleSlice";
import { updateFavorite } from "@/redux/user/userSlice";
import { FaStar } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { MdBrush, MdDelete } from "react-icons/md";

import type { Types } from "@defierros/types";

import AuctionRibbonSVG from "../../public/AuctionRibbon.svg";
// import { deleteCarDetail } from "@/redux/carDetail/carDetailSlice";
import Modal from "../common/Modal";
import CountDownTimer from "./CountDownTimer";

const handleUpdate = () => {};

export const AutoCard = ({
  car,
  auctionId = "",
  saleId = "",
  bids = [],
  adminView = false,
  userView = false,
  isSeller = false,
  users = [],
  userId = "",
  userEmail = "",
  userFavorites = [],
  sold,
  cardType,
}: {
  car: Types.CarsSelectType;
  auctionId: string;
  saleId: string;
  bids: Types.BidsSelectType[];
  adminView: boolean;
  userView: boolean;
  isSeller: boolean;
  users: Types.UsersSelectType[];
  userId: string;
  userEmail: string;
  userFavorites: string[];
  sold: boolean;
  cardType: string;
}) => {
  const { endTime, startingPrice } = car;

  const postId = auctionId || saleId;

  const [currentBid, setCurrentBid] = useState(0);
  // const dispatch = useDispatch();

  const handleUpdateFavorites = async (postId) => {
    await dispatch(updateFavorite({ userId: userId, postId: postId }));
  };

  useEffect(() => {
    if (bids?.length > 0) {
      setCurrentBid(bids[bids.length - 1].ammount);
    } else {
      setCurrentBid(startingPrice);
    }
  }, [bids, startingPrice]);

  const [modals, setModals] = useState({
    delete: {
      inView: false,
      onConfirm: async function ({ car }: { car: Types.CarsSelectType }) {
        // const response = dispatch(
        //   deleteCarDetail({
        //     carDetailId: car.id,
        //   })
        // );
        // if (response) {
        //   location.reload();
        // }
      },
    },
    updateSold: {
      inView: false,
      onConfirm: async function ({ userEmail, saleId }) {
        dispatch(updateSale({ sold: true, saleId, userEmail }));
      },
    },
    update: { inView: false, onConfirm: handleUpdate },
  });

  const handleViewModal = (modal) => {
    setModals({
      ...modals,
      [modal]: { ...modals[modal], inView: !modals[modal].inView },
    });
  };

  const postLink = () => {
    if (auctionId) {
      return `/auctions/${auctionId}`;
    }
    if (saleId) {
      return `/sales/${saleId}`;
    }
  };

  if (!car.images) <></>;

  switch (cardType) {
    case "admin_or_user_post":
      return (
        <article className="group relative w-full">
          {/* <SoldButton
            userEmail={userEmail}
            userView={userView}
            isSeller={isSeller}
            saleId={saleId}
            sold={sold}
            modals={modals}
            handleViewModal={handleViewModal}
          />

          <AdminButtons
            users={users}
            modals={modals}
            car={car}
            adminView={adminView}
            handleViewModal={handleViewModal}
          />

          <FavoritesButton
            userId={userId}
            postId={postId}
            handleUpdateFavorites={handleUpdateFavorites}
            userFavorites={userFavorites}
          /> */}

          <Link className="mx-auto" href={postLink()}>
            <CarDetail
              auctionId={auctionId}
              saleId={saleId}
              userFavorites={userFavorites}
              userId={userId}
              postId={postId}
              sold={sold}
              currentBid={currentBid}
              adminView={adminView}
              userView={userView}
              isSeller={isSeller}
              car={car}
            />
          </Link>
        </article>
      );
      break;
    case "public_post":
      return (
        <article className="group relative w-full">
          {/* <FavoritesButton
            userId={userId}
            postId={postId}
            handleUpdateFavorites={handleUpdateFavorites}
            userFavorites={userFavorites}
          /> */}
          {!!auctionId && <AuctionRibbon />}
          <Link className="mx-auto" href={postLink()}>
            <CarDetail
              auctionId={auctionId}
              saleId={saleId}
              userFavorites={userFavorites}
              userId={userId}
              postId={postId}
              endTime={endTime}
              sold={sold}
              currentBid={currentBid}
              car={car}
            />
          </Link>
        </article>
      );
      break;
    default:
      return (
        <article className="group relative w-full">
          <AdminButtons
            users={users}
            modals={modals}
            car={car}
            adminView={adminView}
            handleViewModal={handleViewModal}
          />
          <div className="cursor-default">
            <CarDetail
              auctionId={auctionId}
              saleId={saleId}
              userFavorites={userFavorites}
              userId={userId}
              postId={postId}
              endTime={endTime}
              sold={sold}
              currentBid={currentBid}
              car={car}
            />
          </div>
        </article>
      );
  }
};

const CarDetail = ({ auctionId, saleId, sold, currentBid, car }) => {
  const {
    brand,
    model,
    year,
    highlights,
    kilometers,
    minPrice,
    endTime,
    images,
    city,
    province,
  } = car;

  const checkNotFinished = (endTime, sold) => {
    // if (new Date().toISOString() < endTime && sold === false) {
    //   return true;
    // }

    if (new Date().toISOString() < endTime && sold === true) {
      return false;
    }

    if (new Date().toISOString() > endTime) {
      return false;
    }

    return true;
  };

  return (
    <div className="relative flex">
      <div
        className={`group aspect-video h-80 grow overflow-hidden rounded-md shadow-md md:w-[22rem] md:max-w-none lg:w-[22rem] xl:w-[20rem] 2xl:w-[22rem] ${
          auctionId || saleId
            ? "bg-gray-100 hover:bg-gray-200"
            : "bg-red-50 hover:bg-red-100"
        } transition-all duration-150`}
      >
        <div className="relative h-[60%] max-w-full overflow-hidden">
          <div className="flex h-full items-center">
            <Image
              width={350}
              height={200}
              sizes="(max-width: 768px) 70vw, (max-width: 1280px) 35vw, 30vw"
              src={images[0]}
              alt={brand + model + "-image"}
              className={`h-full w-full ${
                checkNotFinished(endTime, sold) ? "" : "grayscale"
              } object-cover`}
              priority={true}
            />
          </div>

          {saleId && (
            <div
              className={`absolute bottom-1 flex w-full items-end justify-end`}
            >
              <div className={`me-2 rounded-md bg-zinc-800 px-2 py-1 text-sm`}>
                <li className="flex items-center font-semibold text-white">
                  <p className="me-1 text-gray-500">
                    {sold && "Vendido - "}Clasificado
                  </p>
                  U${Intl.NumberFormat("en-US").format(minPrice)}
                </li>
              </div>
            </div>
          )}

          {auctionId && (
            <div className="absolute bottom-1 flex w-full items-end justify-end text-sm">
              <ul
                className={`grid ${
                  checkNotFinished(endTime, sold) && "grid-cols-[0.4fr__0.6fr]"
                } me-2 w-auto min-w-[200px] gap-x-2 rounded-md bg-zinc-800 px-2 py-1`}
              >
                <li className="flex w-full items-center justify-start gap-1 font-semibold whitespace-nowrap text-white">
                  <FiClock className="text-gray-500" />

                  <CountDownTimer endDate={endTime} />
                </li>
                {checkNotFinished(endTime, sold) && (
                  <li className="flex w-full items-center justify-start gap-1 font-semibold text-white">
                    <p className="text-gray-500">Oferta</p>
                    <p>
                      U$
                      {currentBid
                        ? Intl.NumberFormat("en-US").format(currentBid)
                        : Intl.NumberFormat("en-US").format(minPrice)}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="flex h-[40%] max-w-full flex-col p-2">
          <div className="flex items-center justify-between">
            <h2 className="font-oswaldFamily w-[30ch] items-center gap-2 truncate text-xl font-bold md:w-[32ch] xl:w-[25ch] 2xl:w-[28ch]">
              {brand + " "}
              {model + " "}
              {year}
            </h2>
          </div>

          <div className="flex h-full w-full flex-col">
            <div className="w-full grow text-sm">
              <p className="line-clamp-2">{featuresArrayToText(highlights)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{kilometers}km</p>
              <p className="text-sm text-gray-400">
                {city}, {province}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FavoritesButton = ({
  userId,
  handleUpdateFavorites,
  userFavorites,
  postId,
}) => {
  if (userId) {
    return (
      <button
        onClick={() => handleUpdateFavorites(postId)}
        className="absolute right-4 bottom-[29.5%] z-10 md:bottom-[30.5%]"
      >
        <FaStar
          className={`text-xl ${
            userFavorites.includes(postId)
              ? "text-black"
              : "text-gray-400 hover:text-gray-500"
          } `}
        />
      </button>
    );
  }
};

const AuctionRibbon = () => {
  return (
    <div className="absolute top-0 left-0 z-10 md:bottom-[30.5%]">
      <Image src={AuctionRibbonSVG} alt="auction" width={75} height={75} />
    </div>
  );
};

const AdminButtons = ({ adminView, handleViewModal, car, modals, users }) => {
  if (adminView) {
    return (
      <>
        <Modal
          title={car.brand + " " + car.model}
          inView={modals.update.inView}
          handleView={() => handleViewModal("update")}
        >
          <CarDetailForm creatingPost={true} users={users} model={car} />
        </Modal>

        <Modal
          title={"¿Estas seguro?"}
          inView={modals.delete.inView}
          handleView={() => handleViewModal("delete")}
          onConfirm={() => modals.delete.onConfirm({ car })}
        >
          {car.AuctionId || car.SaleId ? (
            <p>
              No hay vuelta atrás a esta acción. Una vez que la publicación es
              eliminada, no podrá recuperarla y el detalle de vehículo{" "}
              <b>&quot;{car.brand + " " + car.model}&quot;</b> será eliminado de
              nuestra base de datos.
            </p>
          ) : (
            <p>
              No hay vuelta atrás a esta acción. Una vez que el detalle de
              vehículo <b>&quot;{car.brand + " " + car.model}&quot;</b> es
              eliminado, también será eliminado de nuestra base de datos.
            </p>
          )}
        </Modal>

        <ul className="absolute top-0 right-0 z-10 m-2 flex scale-0 items-center gap-2 text-lg text-white transition-all duration-300 group-hover:scale-100">
          <li>
            <button
              className="rounded-md border-2 border-red-500 p-1 text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
              onClick={() => handleViewModal("delete")}
            >
              <MdDelete />
            </button>
          </li>
          <li>
            <button
              className="rounded-md border-2 border-blue-500 p-1 text-blue-500 transition-all duration-300 hover:bg-blue-500 hover:text-white"
              onClick={() => handleViewModal("update")}
            >
              <MdBrush />
            </button>
          </li>
        </ul>
      </>
    );
  }
};

const SoldButton = ({
  userView,
  isSeller,
  saleId,
  sold,
  handleViewModal,
  modals,
  userEmail,
}) => {
  if (userView && isSeller && saleId && !sold) {
    return (
      <>
        <Modal
          title={"Actualizar estado"}
          inView={modals.updateSold.inView}
          handleView={() => handleViewModal("updateSold")}
          onConfirm={() => modals.updateSold.onConfirm({ userEmail, saleId })}
        >
          <p>
            Presiona &quot;Confirmar&quot; para marcar este vehículo como
            &quot;vendido&quot; y dar por finalizada la publicación.{" "}
            <span className="font-semibold text-red-500">
              Esta acción es irreversible.
            </span>
          </p>
        </Modal>

        <ul className="absolute top-0 right-0 z-10 m-2 flex scale-0 items-center gap-2 text-lg text-white transition-all duration-300 group-hover:scale-100">
          <li>
            <button
              className="rounded-md border-2 border-red-500 p-1 text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
              onClick={() => handleViewModal("updateSold")}
            >
              <MdBrush />
            </button>
          </li>
        </ul>
      </>
    );
  }
};

export default AutoCard;
