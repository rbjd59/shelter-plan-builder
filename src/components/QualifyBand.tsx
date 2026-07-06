import { Link } from "@tanstack/react-router";

/**
 * Landing-page band: "Do you have U.S.-citizen children? Primary earner?
 * See if you qualify for a no-cost or low-cost program."
 */
export default function QualifyBand() {
  return (
    <section className="w-full bg-gradient-to-br from-red-700 to-red-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          ¿Programa sin costo o de bajo costo?
        </h2>
        <p className="text-lg md:text-xl mb-2">
          For those with American children (or children in the U.S.) who are the
          household's primary income earner, you may qualify for a{" "}
          <strong>no-cost or low-cost program</strong>.
        </p>
        <p className="text-sm md:text-base opacity-90 mb-6">
          Para los que tienen hijos americanos (o hijos en EE.UU.) y son el
          principal sostén del hogar, pueden calificar para un programa sin
          costo o de bajo costo.
        </p>
        <Link
          to="/qualify"
          className="inline-block bg-white text-red-800 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          See if I qualify →
        </Link>
      </div>
    </section>
  );
}
