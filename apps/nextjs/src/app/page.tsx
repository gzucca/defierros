// import { Suspense } from "react";

import {  api, HydrateClient } from "~/trpc/server";
import { AutoCard } from "@defierros/ui";

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

  const cars = await api.cars.byPostType({ postType: "auction" });


  const car = cars[0];

  if (!car) {
    return <div>No cars found</div>;
  }


  console.log(car);


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
      <main className="mx-auto bg-background text-black min-h-[70vh] max-w-[1400px]">
        <h1 className="clip-path-inset absolute h-[1px] w-[1px] overflow-hidden border-0 p-0">
          Clasificados y subastas
        </h1>

        <p>This is a test</p>

        <AutoCard

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
