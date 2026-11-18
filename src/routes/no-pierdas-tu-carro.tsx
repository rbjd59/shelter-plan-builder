import { createFileRoute } from "@tanstack/react-router";
import VehicleProgramPage from "@/components/VehicleProgramPage";
import { vehicleHead, validateVehicleSearch } from "@/lib/vehicle-route";

export const Route = createFileRoute("/no-pierdas-tu-carro")({
  validateSearch: validateVehicleSearch,
  loader: ({ location }) => ({ lang: validateVehicleSearch(location.search).lang ?? "es" }),
  head: ({ loaderData }) => vehicleHead(loaderData?.lang ?? "es", "/no-pierdas-tu-carro"),
  component: VehicleProgramPage,
});
