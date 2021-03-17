export const titleParser = (review: string) => {
  const parti = review?.match(/^.+?\<br\>/);
  var title = '';
  if(parti) {
    title = parti[0];
    review = review?.replace(title, '');
    title = title.replace(/\<br\>/gi, '');
  }
  if(title === '') {
    console.log(review);
    throw Error("no title");
  }
  return {review: review, title: title};
}

export const summaryParser = (review: string, summary: string) => {
  const particle = review?.match(/Review[.\:|\:| \: |\: .+?|：]\<br\>.+?\<br\>/);
  if(particle) {
    summary = particle[0];
    review = review?.replace(summary, '');
    summary = summary.replace(/\<br\>/gi, '');
  }
  else {
    var part = review?.match(/^.*\<br\>/);
    if(part) {
      summary = part[0];
    }
    review = review?.replace(summary, '');
    summary = summary.replace(/\<br\>/gi, '');
  }
  return {review: review, summary: summary};
}