"use client";

import { CardPayment } from "@mercadopago/sdk-react";
import { StatusScreen } from "@mercadopago/sdk-react";
import { env } from "@defierros/env";
import { useEffect, useRef, useState } from "react";

//! SOLO PARA STORYBOOK
// import { initMercadoPago } from "@mercadopago/sdk-react";
// initMercadoPago(process.env.MERCADOPAGO_PUBLIC_KEY, { locale: "es-AR" });

export default function MPCard({ user, amount, auction, newOffer }) {
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const ipAddress = useRef(null);

  useEffect(() => {
    (async () => {
      await fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
          ipAddress.current = data.ip;
        })
        .catch((error) => console.log(error));
    })();
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
        excluded: ["debit_card"],
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

  const onSubmit = async (formData) => {
    Object.assign(formData, { user: user });
    Object.assign(formData, { auction: { id: auction.id } });
    Object.assign(formData, { newOffer: newOffer });
    Object.assign(formData, { ipAddress: ipAddress.current });
    Object.assign(formData, { deviceId: deviceId });


    try {
      const response = await fetch(
        `${env.BACKEND_URL}/payment/createBidPayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-meli-session-id": deviceId,
          },
          body: formData ? JSON.stringify(formData) : "",
        }
      ).then((response) => response.json());

      console.log(response);
      if (response.error === false) {
        setApiResponse(response.data);
      } else {
        setError(
          'Ocurrió un error con el procesamiento de tu pago. Por favor comunicate con el administrador de la pagina al mail info@defierros.com con el asunto "ERROR PROCESAMIENTO DE PAGO". Te pedimos disculpas por las molestias.'
        );
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

  const onError = async (error) => {
    // callback called for all Brick error cases
    console.log("error en onError: " + JSON.stringify(error));
  };

  const onReady = async (status) => {
    /*
      Callback called when Brick is ready.
      Here you can hide loadings from your site, for example.
    */
    console.log("onReady: " + JSON.stringify(status));
  };

  return (
    <section className="min-w-0 max-w-full bg-white p-2 md:p-4">
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

