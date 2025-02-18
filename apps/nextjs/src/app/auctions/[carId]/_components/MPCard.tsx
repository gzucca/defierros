"use client";

import {
  CardPayment,
  StatusScreen
} from "@mercadopago/sdk-react";
import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/esm/bricks/cardPayment/type";
import type { IBrickError } from "@mercadopago/sdk-react/esm/bricks/util/types/common";
import { useEffect, useRef, useState } from "react";


import { api } from "~/trpc/react";

type TCardPaymentBrickPaymentType = "credit_card" | "debit_card";

export default function MPCard({
  userId,
  amount,
  auctionId,
}: {
  userId: string;
  auctionId: string;
  amount: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const ipAddress = useRef<string>("");

  const bidPaymentMutation = api.payments.post.bidPayment.useMutation();


  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        ipAddress.current = data.ip;
      })
      .catch((error) => console.log(error));
  }, []);

  const initialization = {
    amount: amount,
    // payer: {
    //   email: user?.email,
    // },
  };
  const customization = {
    paymentMethods: {
      types: {
        excluded: ["debit_card" as TCardPaymentBrickPaymentType],
      },
      maxInstallments: 1,
    },
    visual: {
      texts: {
        formTitle: "Tarjeta de crédito",
        formSubmit: "Ofertar",
        email: {
          label: "Mail de cuenta de MercadoPago",
        },
      },
      style: {
        customVariables: {
          formPadding: "0px",
        },
      },
    },
  };

  const onSubmit = async (
    formData: ICardPaymentFormData<ICardPaymentBrickPayer>,
  ) => {
    Object.assign(formData, { userId: userId });
    Object.assign(formData, { auctionId: auctionId });
    Object.assign(formData, { ipAddress: ipAddress.current });
    // Object.assign(formData, { deviceId: deviceId });

    if (
      !formData.payer.email ||
      !formData.payer.identification?.number ||
      !formData.payer.identification.type
    ) {
      setError("Información de pago incompleta");
      return;
    }

    try {
      const response = await bidPaymentMutation.mutateAsync({
        userId,
        auctionId,
        token: formData.token,
        issuer_id: formData.issuer_id,
        payment_method_id: formData.payment_method_id,
        transaction_amount: amount,
        installments: formData.installments,
        payer: {
          email: formData.payer.email,
          identification: {
            type: formData.payer.identification.type,
            number: formData.payer.identification.number,
          },
        },
        ipAddress: ipAddress.current,
      });

      if (response.error) {
        console.log("error de onSubmit: ", response.error);
        setError(
          'Ocurrió un error con el procesamiento de tu pago. Por favor comunicate con el administrador de la pagina al mail info@defierros.com con el asunto "ERROR PROCESAMIENTO DE PAGO". Te pedimos disculpas por las molestias.',
        );
      } else {
        setApiResponse(response.value);
      }

      // if (
      //   (responsejson.data.status_detail === "pending_challenge" ||
      //     responsejson.data.status_detail === "pending_contingency") &&
      //   Object.hasOwn(responsejson.data, "three_ds_info")
      // ) {
      //   localStorage.setItem("paymentId", responsejson.data.id);
      //   await setVerification3ds(responsejson.data);
      // } else if (responsejson.data.api_response.status === 201) {
      //   location.reload();
      // }
    } catch (error) {
      console.log("error de onSubmit: ", error);
    }
  };

  const onError = async (error: IBrickError) => {
    // callback called for all Brick error cases
    console.log("error en onError: " + JSON.stringify(error));
  };

  const onReady = async () => {
    /*
      Callback called when Brick is ready.
      Here you can hide loadings from your site, for example.
    */
    console.log("onReady: " + JSON.stringify(status));
  };

  return (
    <section className="max-w-full min-w-0 bg-white p-2 md:p-4">
      {error && <p className="my-2 text-2xl font-bold text-red-600">{error}</p>}

      {!error &&
        (apiResponse ? (
          <StatusScreen
            initialization={{
              paymentId: apiResponse.id,
              additionalInfo: {
                externalResourceURL:
                  apiResponse?.three_ds_info?.external_resource_url,
                creq: apiResponse?.three_ds_info?.creq,
              },
            }}
            onReady={onReady}
            onError={onError}
          />
        ) : (
          <CardPayment
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
            locale="es-AR"
          />
        ))}
    </section>
  );
}
