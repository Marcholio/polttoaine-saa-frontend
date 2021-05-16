import { Button } from "@material-ui/core";
import { FUELS } from "../constants";

import { Fuel } from "../types";

const fuelSelector = (props: {
  selectedFuel: Fuel;
  updateSelectedFuel: (fuel: Fuel) => void;
}) => (
  <div id="fuelSelector">
    {Object.keys(FUELS).map((fuel: string) => (
      <Button
        key={fuel as string}
        color={props.selectedFuel === fuel ? "primary" : "default"}
        variant="contained"
        onClick={() => props.updateSelectedFuel(fuel as Fuel)}
      >
        {FUELS[fuel as Fuel]}
      </Button>
    ))}
  </div>
);

export default fuelSelector;
