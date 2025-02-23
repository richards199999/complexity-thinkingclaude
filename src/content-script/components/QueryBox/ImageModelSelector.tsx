import { createListCollection } from "@ark-ui/react";
import { LuCpu as Cpu, LuImage as Image } from "react-icons/lu";

import {
  ImageModel,
  imageModelIcons,
} from "@/content-script/components/QueryBox";
import { imageModels } from "@/content-script/components/QueryBox/consts";
import { useQueryBoxStore } from "@/content-script/session-store/query-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/Select";
import Tooltip from "@/shared/components/Tooltip";
import { isReactNode } from "@/types/utils.types";

export default function ImageModelSelector() {
  const limit = useQueryBoxStore((state) => state.imageCreateLimit);

  const value = useQueryBoxStore((state) => state.selectedImageModel);
  const setValue = useQueryBoxStore((state) => state.setSelectedImageModel);

  return (
    <Select
      collection={createListCollection({
        items: imageModels.map((model) => model.code),
      })}
      value={[value]}
      onValueChange={(details) => {
        setValue(details.value[0] as ImageModel["code"]);
      }}
    >
      <Tooltip
        content="Choose image model"
        positioning={{
          gutter: 8,
        }}
      >
        <SelectTrigger variant="ghost" className="!tw-px-0 !tw-py-0">
          <div className="tw-flex tw-min-h-8 !tw-w-fit tw-max-w-[200px] tw-select-none tw-items-center tw-justify-center tw-gap-2 !tw-px-2 tw-font-medium tw-transition-all tw-duration-300 active:!tw-scale-95 [&_span]:tw-max-w-[150px]">
            <Image className="tw-size-4" />
            <SelectValue>
              {imageModels.find((model) => model.code === value)?.shortLabel}
            </SelectValue>
            <span className="!tw-self-start tw-text-[.5rem] tw-text-accent-foreground">
              {limit}
            </span>
          </div>
        </SelectTrigger>
      </Tooltip>
      <SelectContent className="custom-scrollbar tw-max-h-[500px] tw-max-w-[200px] tw-overflow-auto tw-font-sans">
        {imageModels.map((model) => (
          <Tooltip
            key={model.code}
            content={limit}
            disabled={value === model.code}
            positioning={{
              placement: "right",
              gutter: 10,
            }}
          >
            <SelectItem
              key={model.code}
              item={model.code}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="tw-flex tw-max-w-full tw-items-center tw-justify-around tw-gap-2">
                {isReactNode(imageModelIcons[model.code]) ? (
                  <div className="tw-text-[1.1rem]">
                    {imageModelIcons[model.code]}
                  </div>
                ) : (
                  <Cpu className="tw-size-4" />
                )}
                <span className="tw-truncate">{model.label}</span>
              </div>
            </SelectItem>
          </Tooltip>
        ))}
      </SelectContent>
    </Select>
  );
}
