// converts given marks to whatsapp-style markdown string
export const setMarksOnText = (marks: any, text: string) => {
  let textContent = text;
  for (let index = 0; index < marks.length; index++) {
    switch (marks[index].type) {
      case "strong":
        textContent = `*${textContent}*`;
        break;
      case "em":
        textContent = `_${textContent}_`;
        break;
      case "s":
        textContent = `~${textContent}~`;
        break;
      case "code":
        textContent = "```" + textContent + "```";
        break;
    }
  }
  return textContent;
};
