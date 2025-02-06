"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Types } from "@defierros/types";

// TODO: Create MPCard component in _components folder
// import MPCard from "@/common/MPCard";

// TODO: Move this to env config
const commissionPercentage = 0.02;

interface Props {
  user: Types.UsersInsertType;
  auction: Types.CarsSelectType;
  dollarValue: number;
  currentBid: number;
  cardsMP: unknown; // TODO: Define proper type for cardsMP
}

function EnterOffer({ user, auction, dollarValue, currentBid, cardsMP }: Props) {
  const [newOffer, setNewOffer] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState({ lowBid: "", highBid: "" });

  const handleSetAmount = (event: React.KeyboardEvent | null, amount: string) => {
    if (event && event.key !== "Enter") return;

    const currentOffer = Number(amount);
    const lowBid = currentOffer < currentBid + 100;
    const lowBidOver5k = currentBid > 50000 && currentOffer < currentBid + 250;
    const highBid =
      currentBid > 0 &&
      currentOffer > currentBid + 1000 &&
      error.highBid === "";
    if (lowBid) {
      const errorMessage = `Su oferta debe ser al menos U$100 mayor a la oferta actual. Oferta mínima: $${
        currentBid + 100
      }`;
      return setError((prev) => {
        return { ...prev, lowBid: errorMessage };
      });
    }
    if (lowBidOver5k) {
      const errorMessage = `Su oferta debe ser al menos U$250 mayor a la oferta actual. Oferta mínima: $${
        currentBid + 250
      }`;
      return setError((prev) => {
        return { ...prev, lowBid: errorMessage };
      });
    }
    setError((prev) => {
      return { ...prev, lowBid: "" };
    });
    if (highBid) {
      const errorMessage = `Su oferta de USD${currentOffer} es muy superior a la oferta anterior de USD${currentBid}. Vuelva a confirmar si quiere avanzar con su oferta.`;
      return setError((prev) => {
        return { ...prev, highBid: errorMessage };
      });
    }
    setError({ lowBid: "", highBid: "" });
    setAmount(String(Math.floor(currentOffer * commissionPercentage * dollarValue)));
  };

  return (
    <div className="scrollbar-stable-both max-w-2xl">
      <div className="flex flex-col px-4">
        <div>
          {auction.images?.[0] && (
            <Image
              key={auction.images[0] + "key"}
              width={100}
              height={75}
              src={auction.images[0]}
              alt={auction.brand + auction.model}
            className={`mx-auto aspect-video ${
              amount ? "hidden" : "block"
            } h-full w-[75%] rounded-md object-cover`}
            sizes="15vw"
            />
          )}
          <p className="mt-2 text-center text-xl font-semibold md:text-2xl">
            {auction.brand} {auction.model} {auction.year}
          </p>
          <p className="mt-1 text-center md:text-lg">
            Oferta actual: U${Intl.NumberFormat("en-US").format(currentBid)}
          </p>
          <p className="mx-auto mt-1 text-center text-xs text-gray-600 md:text-base">
            Esta subasta finaliza el{" "}
            {auction.endTime?.toLocaleDateString("es-AR")} a las{" "}
            {auction.endTime?.toLocaleTimeString("es-AR")}
          </p>
        </div>
        <hr className="my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25" />
        {!amount ? (
          <section className="md:max-w-min">
            <div className="flex items-center justify-center gap-2">
              <label className="md:text-2xl" htmlFor="ammountInput">
                U$
              </label>
              <input
                className="flex min-w-0 rounded-md border-2 border-gray-300 px-1.5 py-1 disabled:text-gray-500 md:w-[36] md:text-2xl"
                id="ammountInput"
                type="number"
                disabled={amount ? true : false}
                value={newOffer === "0" ? "" : newOffer}
                onChange={(e) => setNewOffer(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => handleSetAmount(e, newOffer)}
                min={currentBid + 100}
              />
              <button
                disabled={amount ? true : false}
                onClick={() => handleSetAmount(null, newOffer)}
                className="mx-0 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 md:text-lg"
              >
                Continuar
              </button>
            </div>
            <p className="my-2 text-xs text-gray-600 md:text-base">
              {currentBid < 50000
                ? "El incremeto mínimo al ofertar debe ser de U$100"
                : "El incremeto mínimo al ofertar debe ser de U$250"}
            </p>
            <p className="min-w-0 text-xs text-red-800 md:text-base">
              {error.lowBid}
            </p>
            <p className="min-w-0 text-xs text-red-800 md:text-base">
              {error.highBid}
            </p>
          </section>
        ) : (
          <section className="text-sm md:text-lg">
            <div className="mb-2 grid grid-cols-[70%,_30%]">
              <p>Tu oferta:</p>
              <p className="font-bold">U${newOffer}</p>
              <p>Cargos por oferta ganadora:</p>
              <p className="flex items-center font-bold">
                U${Math.floor(Number(newOffer) * commissionPercentage)}
              </p>
            </div>

            <p className="text-justify text-sm md:text-base">
              En caso de que nadie supere tu oferta, y esta alcance el precio
              mínimo elegido por el vendedor, serás el ganador de la subasta!{" "}
              <br /> <br /> Si decidís ofertar, pondremos una retención en tu
              tarjeta por el{" "}
              <span className="font-bold">{commissionPercentage * 100}%</span>{" "}
              del monto ofertado, en pesos al tipo de cambio oficial del día.
              Esto nos asegura que tengas el saldo suficiente para pagar
              nuestros cargos en caso de que ganes la subasta. <br /> <br /> Si
              tu oferta es superada, o no alcanza el mínimo, la retención se
              libera automáticamente y no te cobraremos nada. <br /> <br /> En
              este caso, el cargo por ganar la subasta corresponde a{" "}
              <span className="font-bold">AR${amount}</span> (pesos argentinos),
              ya que la cotización actual del dólar oficial es de{" "}
              <span className="font-bold">${dollarValue}</span>. <br /> <br />{" "}
              El monto de la oferta es lo que luego le deberás pagar al vendedor
              para concretar la compra. <br /> <br /> Al ofertar, estas
              aceptando los{" "}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="/terms-of-use"
                className="underline"
              >
                términos y condiciones
              </Link>{" "}
              de DeFierros.
            </p>
          </section>
        )}
      </div>
      <div className="mt-4 min-w-0 md:ms-0">
        {/* TODO: Create MPCard component in _components folder
        {amount && (
          <MPCard
            amount={amount}
            newOffer={newOffer}
            auction={auction}
            user={user}
          />
        )} */}
      </div>
    </div>
  );
}

export default EnterOffer;
