import { Text } from "react-native";
import React from "react";
import { Adapt, Label, Select, Sheet } from "tamagui";
import { Check, ChevronDown } from "@tamagui/lucide-icons";

import { Plan } from "../models";

export const SelectPlan = ({
  selectedPlan,
  plans,
  setSelectedPlanId,
}: {
  selectedPlan?: Plan;
  plans: Plan[];
  setSelectedPlanId: (value: React.SetStateAction<number>) => void;
}) => {
  const setVal = (val) => {
    const newPlan = plans.find((plan) => plan.name === val);
    if (newPlan) setSelectedPlanId(newPlan.id);
  };

  React.useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlan]);

  if (!selectedPlan || plans.length === 0 || !Array.isArray(plans)) {
    return <Text>Loading...</Text>;
  }
  return (
    <>
      <Label
        paddingRight="$0"
        minWidth={90}
        justifyContent="flex-end"
        size={"$4"}
        htmlFor={"toggle-done"}
      >
        Wybierz plan
      </Label>
      <Select
        value={selectedPlan.name}
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
              <Select.Label>Plans</Select.Label>
              {plans.map((plan, i) => {
                return (
                  <Select.Item index={i} key={plan.id} value={plan.name}>
                    <Select.ItemText>{plan.name}</Select.ItemText>
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
    </>
  );
};
