export default function (element: any) {
  element.style.overflow = "hidden";
  element.innerHTML = element.innerText
      .split("")
      .map((char: string) => {
          if (char === " ") {
              return `<span>&nbsp;</span>`;
          }
          return `<span class="animatedis">${char}</span>`;
      })
      .join("");

  return element;
}
