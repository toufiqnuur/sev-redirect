import { Context } from "hono";
import { Child, PropsWithChildren } from "hono/jsx";

const NotFoundHeader = () => (
  <div class="mb-6">
    <span class="text-6xl font-bold">404</span>
  </div>
);

const ArchiveIcon = () => (
  <div class="flex justify-center mb-6">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="72"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M22 4H2v6h2v10h16V10h2zM6 10h12v8H6zm14-4v2H4V6zm-5 6H9v2h6z"
      />
    </svg>
  </div>
);

const ExpiredIcon = () => (
  <div class="flex justify-center mb-6">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="72"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M19 3H5v2H3v14h2v2h14v-2h2V5h-2zm0 2v14H5V5zm-8 2h2v6h4v2h-6z"
      />
    </svg>
  </div>
);

const ProtectedIcon = () => (
  <div class="flex justify-center mb-6">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="72"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M15 2H9v2H7v4H4v14h16V8h-3V4h-2zm0 2v4H9V4zm-6 6h9v10H6V10zm4 3h-2v4h2z"
      />
    </svg>
  </div>
);

const HomeButton = ({
  variant = "primary",
}: {
  variant?: "primary" | "secondary";
}) => {
  const className =
    variant === "primary"
      ? "block w-fit bg-blue-600 text-white font-medium mx-auto px-4 py-2 hover:bg-blue-500"
      : "block w-fit bg-gray-200 text-gray-600 font-medium mx-auto px-4 py-2 hover:bg-gray-100";

  return (
    <a href={process.env.FRONTEND_URL} class={className}>
      Kembali ke Beranda
    </a>
  );
};

type StatusPageProps = PropsWithChildren<{
  headerElement: Child;
  title: string;
  description: string;
}>;

const StatusPageView = ({
  headerElement,
  title,
  description,
  children,
}: StatusPageProps) => {
  return (
    <div class="my-48 text-center">
      {headerElement}

      <h2 class="font-bold text-2xl mt-4">{title}</h2>
      <p class="mt-4 text-gray-500">{description}</p>

      <div class="mt-8">{children}</div>
    </div>
  );
};

export const NotFoundView = (c: Context) => {
  return (
    <StatusPageView
      headerElement={<NotFoundHeader />}
      title="Halaman Tidak Ditemukan"
      description="Maaf, tautan yang Anda cari tidak ada dalam sistem kami."
    >
      <HomeButton />
    </StatusPageView>
  );
};

export const ArchivedView = (c: Context) => {
  return (
    <StatusPageView
      headerElement={<ArchiveIcon />}
      title="Tautan Telah Diarsipkan"
      description="Maaf, tautan ini sudah tidak aktif dan telah dipindahkan ke arsip."
    >
      <HomeButton />
    </StatusPageView>
  );
};

export const ExpiredView = (c: Context) => {
  return (
    <StatusPageView
      headerElement={<ExpiredIcon />}
      title="Tautan Sudah Kadaluwarsa"
      description="Maaf, tautan ini sudah melewati batas waktu dan tidak dapat diakses lagi."
    >
      <HomeButton />
    </StatusPageView>
  );
};

export const ProtectedView = (c: Context, error?: string) => {
  return (
    <StatusPageView
      headerElement={<ProtectedIcon />}
      title="Tautan Terproteksi"
      description="Tautan ini dilindungi dengan kata sandi. Silakan masukkan kata sandi untuk melanjutkan."
    >
      <form
        method="post"
        action={`/${c.req.param("shortcode")}`}
        class="mt-8 flex flex-col items-center gap-4"
      >
        <input
          type="password"
          name="password"
          placeholder="Masukkan kata sandi"
          class="border border-gray-300 px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p class="text-red-500 text-sm -mt-2">{error}</p>
        <button
          type="submit"
          class="bg-blue-600 text-white font-medium px-6 py-2 hover:bg-blue-500 transition"
        >
          Buka Tautan
        </button>
      </form>
    </StatusPageView>
  );
};
