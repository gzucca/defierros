/**
 * TODO: The following items need to be completed to finish adapting this component:
 * 1. Create/update the types package to properly export the database schema types
 * 2. Update the UI components to match the new props interface:
 *    - Modal component needs to handle open, onOpenChange, and onConfirm props
 *    - CountdownTimer component needs to be created/updated
 * 3. Create the CheckWebViewContext provider in the UI package
 * 4. Update the imports to use the correct paths once the components are in place
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiClock } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

import type { Types } from "@defierros/types";
import { Button } from "@defierros/ui/src/button";
import CountdownTimer from "@defierros/ui/src/CountdownTimer";
import Modal from "@defierros/ui/src/Modal";

import { api } from "~/trpc/react";
import EnterOffer from "./EnterOffer";

interface CountDownBarProps {
  user?: Types.UsersSelectType;
  auction: Types.CarsSelectType;
  className?: string;
  currentBid: number;
  currentEndTime: string;
}

export default function CountDownBar({
  user,
  auction,
  className,
  currentBid,
  currentEndTime,
}: CountDownBarProps) {
  const router = useRouter();
  const [cardsMP, setCardsMP] = useState<Record<string, unknown>>({});
  const [dollarValue, setDollarValue] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [modals, setModals] = useState({
    register: {
      inView: false,
      onConfirm: async function () {
        router.push(`/api/auth/login?returnTo=${window.location.pathname}`);
      },
    },
    completeProfile: {
      inView: false,
      onConfirm: async function (userId: string) {
        router.push(`/profile/${userId}`);
      },
    },
    makeOffer: {
      inView: false,
      onConfirm: async function () {
        // Will be implemented when we add the bid functionality
      },
    },
  });

  const smoothScrollTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id !== "barButton") {
      const element = document.getElementById("imagesCarrousel");
      element?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  };

  const renderAuctionButton = ({
    user,
    auction,
  }: {
    user?: Types.UsersSelectType;
    auction: Types.CarsSelectType;
  }) => {
    if (user?.id === auction.userId) {
      return (
        <Button
          disabled
          id="barButton"
          className="mx-auto w-fit rounded-md bg-gray-800 px-[1.2em] py-[0.7em] text-sm font-semibold text-white md:text-base"
        >
          Vendedor
        </Button>
      );
    }
    if (auction.endTime && auction.endTime < new Date()) {
      return (
        <Button
          disabled
          id="barButton"
          className="mx-auto w-fit rounded-md bg-gray-800 px-[1.2em] py-[0.7em] text-sm font-semibold text-white md:text-base"
        >
          Finalizada
        </Button>
      );
    }
    if (user?.email && (!user.name || !user.phoneNumber)) {
      return (
        <>
          <Button
            id="barButton"
            onClick={() => handleViewModal("completeProfile")}
            className="bg-red-700 text-white"
          >
            Participar
          </Button>
        </>
      );
    }
    if (user?.mercadoPagoId) {
      return (
        <Button
          id="barButton"
          disabled={loading}
          onClick={() => void handleMakeOffer()}
          className={`text-white ${
            loading ? "cursor-wait bg-gray-600" : "bg-green-600"
          } hover:bg-green-700`}
        >
          Ofertar
        </Button>
      );
    }
    return (
      <Button
        onClick={() => handleViewModal("register")}
        id="barButton"
        className="bg-gray-600 text-white hover:bg-gray-700"
      >
        Participar
      </Button>
    );
  };

  const handleViewModal = (modal: keyof typeof modals) => {
    setModals((prev) => {
      return {
        ...prev,
        [modal]: { ...prev[modal], inView: !prev[modal].inView },
      };
    });
  };

  const handleMakeOffer = async () => {
    setLoading(true);
    try {
      // TODO: Replace with tRPC mutations when they are created
      // const customerResponse = await api.mercadoPago.getCustomer.query({ customerId: user?.mercadoPagoId });
      // const dollarResponse = await api.mercadoPago.getDollarValue.query();
      // setCardsMP(customerResponse);
      // setDollarValue(dollarResponse);
    } finally {
      setLoading(false);
    }
    handleViewModal("makeOffer");
  };

  const c = twMerge("z-10", className);

  return (
    <>
      <div onClick={smoothScrollTo} className={c}>
        <div className="grid grid-cols-3 items-center bg-zinc-800 py-1 ps-2 pe-1 text-white md:grid-cols-[30%,_40%,_30%]">
          <span className="flex items-center gap-1 font-semibold text-white">
            <span className="text-gray-700">
              <FiClock />
            </span>
            <CountdownTimer endDate={currentEndTime} />
          </span>
          <span className="mx-auto text-lg font-semibold">
            U${Intl.NumberFormat("en-US").format(currentBid)}
          </span>
          {renderAuctionButton({ user, auction })}
        </div>
      </div>
      <Modal
        title={"Participar en subastas"}
        inView={modals.register.inView}
        handleView={() => handleViewModal("register")}
        onConfirm={() => modals.register.onConfirm()}
        confirmText="Ingresar"
      >
        Para participar en una subasta, primero debes registrarte e ingresar con
        tu usuario.
      </Modal>

      {user?.id && (
        <Modal
          title="¡Queremos conocerte!"
          inView={modals.completeProfile.inView}
          handleView={() => handleViewModal("completeProfile")}
          onConfirm={() => modals.completeProfile.onConfirm(user.id)}
          confirmText="Ir a perfil de usuario"
        >
          Debes completar tu información personal para participar en una
          subasta. Esta información no será compartida a otros usuarios.
        </Modal>
      )}

      {user?.id && (
        <Modal
          title="Participar en subasta"
          inView={modals.makeOffer.inView}
          handleView={() => handleViewModal("makeOffer")}
        >
          <EnterOffer
            user={user}
            auction={auction}
            dollarValue={dollarValue ?? 0}
            currentBid={currentBid}
            cardsMP={cardsMP}
          />
        </Modal>
      )}
    </>
  );
}
