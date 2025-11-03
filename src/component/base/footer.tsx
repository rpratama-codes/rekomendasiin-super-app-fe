/** biome-ignore-all lint/performance/noImgElement: <No Need Next Image Optimization> */
export default function NavBar() {
  return (
    <div className="flex w-full h-14 justify-center items-center bg-gradient-to-bl from-red-600 to-red-800 text-white ">
      <div className="container">
        <div
          id="nav-body"
          className="flex w-full h-full justify-between items-center"
        >
          <div id="nav-left" className="flex gap-2 items-center">
            <div className="w-10 h-10">
              <img
                className="rounded-md"
                src="https://rekomendasiin.rpratama.web.id/img/logo.svg"
                alt="logo-rekomendasiin"
              />
            </div>
            <p>Rekomendasiin</p>
          </div>

          <div id="nav-right">Hello There! Web is under construction!</div>
        </div>
      </div>
    </div>
  );
}
