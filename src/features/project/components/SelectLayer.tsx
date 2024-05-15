import { Text } from "react-native";
import React from "react";
import { Adapt, Select, Sheet } from "tamagui";
import { Check, ChevronDown } from "@tamagui/lucide-icons";

import { Layer } from "../models";

export const SelectLayer = ({
  selectedLayer,
  layers,
  setSelectedLayerId,
}: {
  selectedLayer?: Layer;
  layers: Layer[];
  setSelectedLayerId: (value: React.SetStateAction<number>) => void;
}) => {
  const setVal = (val) => {
    const newLayer = layers.find((layer) => layer.name === val);
    if (newLayer) setSelectedLayerId(newLayer.id);
  };

  if (!selectedLayer || layers.length === 0 || !Array.isArray(layers)) {
    return <Text>Loading...</Text>;
  }
  return (
    <Select
      value={selectedLayer.name}
      onValueChange={setVal}
      disablePreventBodyScroll
    >
      <Select.Trigger width={220} iconAfter={ChevronDown}>
        <Select.Value placeholder="Something" />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport
          // to do animations:
          // animation="quick"
          // animateOnly={['transform', 'opacity']}
          // enterStyle={{ o: 0, y: -10 }}
          // exitStyle={{ o: 0, y: 10 }}
          minWidth={200}
        >
          <Select.Group>
            <Select.Label>Layers</Select.Label>
            {layers.map((layer, i) => {
              return (
                <Select.Item index={i} key={layer.id} value={layer.name}>
                  <Select.ItemText>{layer.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};
