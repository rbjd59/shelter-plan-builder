import { createFileRoute } from "@tanstack/react-router";
import VehicleProgramPage from "@/components/VehicleProgramPage";
import { vehicleHead, validateVehicleSearch } from "@/lib/vehicle-route";

export const Route = createFileRoute("/pa-pedi-machin-ou")({
  validateSearch: validateVehicleSearch,
  loader: ({ location }) => ({ lang: validateVehicleSearch(location.search).lang ?? "es" }),
  head: ({ loaderData }) => vehicleHead(loaderData?.lang ?? "es", "/pa-pedi-machin-ou"),
  component: VehicleProgramPage,
});
