import CplxUserSettings from "@/cplx-user-settings/CplxUserSettings";
import DomObserver from "@/utils/DomObserver/DomObserver";
import { DomSelectors } from "@/utils/DomSelectors";

export default function CustomSlogan() {
  const slogan = CplxUserSettings.get().customTheme.slogan;

  useEffect(() => {
    const id = "custom-slogan";

    const callback = () => {
      const $nativeSlogan = $(DomSelectors.HOME.SLOGAN);

      if (!$nativeSlogan.length || $nativeSlogan.attr(`data-${id}`)) return;

      const isOnlyText = $nativeSlogan.text().trim() === $nativeSlogan.html();

      if (!isOnlyText) {
        $nativeSlogan.addClass("!tw-opacity-100");
        return;
      }

      $nativeSlogan.attr(`data-${id}`, "true");

      $nativeSlogan.text(slogan || $nativeSlogan.text());

      $nativeSlogan.addClass("!tw-opacity-100");
    };

    requestIdleCallback(callback);

    DomObserver.create(id, {
      target: document.body,
      config: { childList: true, subtree: true },
      source: "hook",
      onAny: callback,
    });

    return () => {
      DomObserver.destroy(id);
    };
  });

  return null;
}
