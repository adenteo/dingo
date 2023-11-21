import { Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Tooltip } from "@chakra-ui/react";
import React, { Dispatch, SetStateAction } from "react";

interface DetourDistanceSliderDetails {
  detourDistance: number;
  setDetourDistance: Dispatch<
  SetStateAction<number>
>;
}

function DetourDistanceSlider({setDetourDistance, detourDistance}: DetourDistanceSliderDetails) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  return (
    <Slider
      id='slider'
      defaultValue={1}
      min={1}
      max={10}
      step={0.5}
      colorScheme='green'
      onChange={(v) => setDetourDistance(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg='green.500'
        color='white'
        placement='top'
        isOpen={showTooltip}
        label={`${detourDistance}km`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  )
}

export default DetourDistanceSlider;