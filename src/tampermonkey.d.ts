declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue<T>(key: string, value: T): void;
declare function GM_registerMenuCommand(
  caption: string,
  onClick: () => void
): number | string;
declare function GM_addValueChangeListener<T>(
  key: string,
  listener: (
    key: string,
    oldValue: T,
    newValue: T,
    remote: boolean
  ) => void
): number;
declare function GM_getResourceURL(name: string): string;
