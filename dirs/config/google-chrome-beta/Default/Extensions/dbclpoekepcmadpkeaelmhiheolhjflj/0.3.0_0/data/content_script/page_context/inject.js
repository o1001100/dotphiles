{
  const _useragent = navigator.userAgent;
  //
  Object.defineProperty(navigator, "userAgent", {
    "get": function () {
      const useragent = localStorage.getItem("useragent-switcher-uastring");
      return useragent ? useragent : _useragent;
    }
  });
}