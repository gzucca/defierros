// import { Suspense } from "react";

import { AutoCard } from "@defierros/ui";

import { api, HydrateClient } from "~/trpc/server";

// import { AuthShowcase } from "./_components/auth-showcase";
// import {
//   CreatePostForm,
//   PostCardSkeleton,
//   PostList,
// } from "./_components/posts";

//THIS IS BECAUSE OF AUTHSHOWCASE
// export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  // void api.post.all.prefetch();
  // void api.cars.all.prefetch();

  const carsResult = await api.cars.get.byId({ id: "0c1a034e-8dbc-47f0-802b-8c0062c1233d" });

  if (!carsResult.value) {
    return <div>Error fetching cars</div>;
  }

  const cars = [carsResult.value];

  if (!cars.length) {
    return <div>No cars found</div>;
  }

  // console.log(car);

  return (
    // <HydrateClient>
    //   <main className="container h-screen py-16">
    //     <div className="flex flex-col items-center justify-center gap-4">
    //       <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
    //         Create <span className="text-primary">T3</span> Turbo
    //       </h1>
    //       {/* <AuthShowcase /> */}

    //       <CreatePostForm />
    //       <div className="w-full max-w-2xl overflow-y-scroll">
    //         <Suspense
    //           fallback={
    //             <div className="flex w-full flex-col gap-4">
    //               <PostCardSkeleton />
    //               <PostCardSkeleton />
    //               <PostCardSkeleton />
    //             </div>
    //           }
    //         >
    //           <PostList />
    //         </Suspense>
    //       </div>
    //     </div>
    //   </main>
    // </HydrateClient>
    <HydrateClient>
      <main className="bg-background mx-auto min-h-[70vh] max-w-[1400px] text-black">
        <h1 className="clip-path-inset absolute h-[1px] w-[1px] overflow-hidden border-0 p-0">
          Clasificados y subastas
        </h1>

        <p>This is a test</p>

        {cars.map((car) => (
          <AutoCard
            key={car.id}
            car={car}
            bids={[]}
            adminView={false}
            userView={false}
            isSeller={false}
            users={[]}
            userId={""}
            userFavorites={[]}
            cardType={"public_post"}
            onUpdateFavorite={undefined}
            onDeleteCar={undefined}
            onUpdateSold={undefined}
          />
        ))}
        <>
          <section className="flex min-h-[50vh] justify-center lg:grid lg:grid-cols-[80fr__20fr] lg:gap-4">
            <div className="grid h-fit w-fit grid-cols-1 place-items-start justify-items-center gap-4 p-0 md:grid-cols-2 md:gap-y-8 lg:w-full xl:grid-cols-3">
              {/* {renderCars([...adminAuctions, ...posts])} */}
            </div>
          </section>
        </>
      </main>
    </HydrateClient>
  );
}
