import puppeteer from 'puppeteer';

export const getDatetime = async (page: puppeteer.Page) => {
  try {
    console.log("load datetime");
    return await page.evaluate(() => {
      const it = (document.querySelector("body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.k_Q0X.I0_K8.NnvRN > a > time") as HTMLTimeElement);
      console.log(it);
      return it.dateTime;
    });
  } catch(err) {
    console.log("fail on load datetime");
  }
}

export const getReview = async (page: puppeteer.Page) => {
  await page.waitForSelector("body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > div > li > div > div > div.C4VMK > span");

  var review = await page.evaluate(() => document.querySelector("body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > div > li > div > div > div.C4VMK > span")?.innerHTML);

  if(!review) return '';

  review = review.replace(/ㅡ+\<br\>/gi, '');
  review = review.replace(/—+\<br\>/gi, '');

  return review;
}

export const isLastPost = async (page: puppeteer.Page, idx: number) => {
  if(idx === 0) return false;
  await page.waitForSelector("body > div._2dDPU.CkGkG > div.EfHg9 > div > div > a.coreSpriteRightPaginationArrow");

  const isLast = await page.evaluate(() => document.querySelector("body > div._2dDPU.CkGkG > div.EfHg9 > div > div > a.coreSpriteRightPaginationArrow") === null);
  if(isLast) return true;
  
  await page.click("body > div._2dDPU.CkGkG > div.EfHg9 > div > div > a.coreSpriteRightPaginationArrow");
  return false;
}

export const loadCommentUntilTop = async (page: puppeteer.Page) => {
  var longer = 0;
  while(true) {
    if(longer > 5) {
      // assume that event post only have 150+ comments
      break;
    }
    const isTop = await page.evaluate(() => document.querySelector("body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > li > div > button") === null);
    if(isTop) break;
    
    longer += 1;
    console.log("prolong page");
    await page.click("body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > li > div > button");
    await page.waitForTimeout(1500);
  }
}

export const isSnuffComment = async (page: puppeteer.Page, commIdx: number) => {
  return await page.evaluate((idx) => {
    const author = document.querySelector(`body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > ul:nth-child(${idx}) > div > li > div > div.C7I1f > div.C4VMK > h3 > div > span > a`);
    if(!author || author.innerHTML !== 'snu_foodfighter') {
      return false;
    }
    return true;
  }, commIdx);
}

export const loadTagsFromComment = async (page: puppeteer.Page, commIdx: number) => {
  var tag = await page.evaluate((idx) => {
    var ans: string[] = [];
    const items = document.querySelectorAll(`body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > ul:nth-child(${idx}) > div > li > div > div.C7I1f > div.C4VMK > span > a`);
    items.forEach(it => ans.push(it.innerHTML));
    return ans;
  }, commIdx);
  if(tag.length !== 0) {
    return tag;
  }
  try {
    await page.click(`body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > ul:nth-child(${commIdx}) > li > ul > li > div > button`);
  } catch(err) {
    console.log("tags not inside commentAnswer");
  }
  tag = await page.evaluate((idx) => {
    var ans: string[] = [];
    const items = document.querySelectorAll(`body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > ul:nth-child(${idx}) > li > ul > div > li > div > div.C7I1f > div.C4VMK > span > a`);
    items.forEach(it => ans.push(it.innerHTML));
    return ans;
  }, commIdx);
  return tag;
}

export const loadPage = async () => {
  var path = '';
  if(process.platform === "win32") path = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  if(process.platform === "darwin") path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: path,
    args: ["--window-size=1080,1920",
            "--disable-web-security"]
  });

  const page = (await browser.pages())[0];
  await page.setViewport({
    width: 1920, height: 1080
  });

  return page;
}

export const loginInstagram = async (page: puppeteer.Page) => {
  await page.goto("https://www.instagram.com/accounts/login/");
  await page.waitForSelector("#loginForm > div > div:nth-child(1) > div > label > input");
  
  await page.type("#loginForm > div > div:nth-child(1) > div > label > input", String(process.env.instagram_id), {delay: 100});
  await page.type("#loginForm > div > div:nth-child(2) > div > label > input", String(process.env.instagram_password), {delay: 100});
  await page.click("#loginForm > div > div:nth-child(3)");
  await page.waitForTimeout(1000 * 5);

  await page.goto("https://www.instagram.com/snu_foodfighter/");
}

export const loadImage = async (page: puppeteer.Page, imgcnt: number) => {
  var items = '';
  try {
    items = await page.evaluate(() => {
      const it = (document.querySelector("article > div._97aPb > div > div.pR7Pc > div.Igw0E.IwRSH.eGOV_._4EzTm.O1flK.D8xaz.fm1AK.TxciK.yiMZG > div > div > div > ul > li:nth-child(2) > div > div > div > div > div.KL4Bh > img") as HTMLImageElement);
      return it.src;
    });
  } catch(err) {
    try {
      items = await page.evaluate(() => {
        const it = (document.querySelector("body > div._2dDPU.CkGkG > div.zZYga > div > article > div._97aPb > div > div.pR7Pc > div.Igw0E.IwRSH.eGOV_._4EzTm.O1flK.D8xaz.fm1AK.TxciK.yiMZG > div > div > div > ul > li:nth-child(3) > div > div > div > div.KL4Bh > img") as HTMLImageElement);
        return it.src;
      });
    }catch(err) {
      console.log("skip! unknown type");
      imgcnt -= 1;
      return '';
    }
  }
  return items;
}

export const isLastImage = async (page: puppeteer.Page) => {
  const isLast = await page.evaluate(() => {
    const it = document.querySelector("body > div._2dDPU.CkGkG > div.zZYga > div > article > div._97aPb > div > div.pR7Pc > div.Igw0E.IwRSH.eGOV_._4EzTm.O1flK.D8xaz.fm1AK.TxciK.yiMZG > div > button._6CZji > div.coreSpriteRightChevron");
    return it === null;
  });
  if(isLast) return true;

  await page.click("body > div._2dDPU.CkGkG > div.zZYga > div > article > div._97aPb > div > div.pR7Pc > div.Igw0E.IwRSH.eGOV_._4EzTm.O1flK.D8xaz.fm1AK.TxciK.yiMZG > div > button._6CZji > div.coreSpriteRightChevron");
  await page.waitForTimeout(500);
        return false;
}

export default {
  loadPage,
  loginInstagram,
  getDatetime,
  getReview,
  isLastPost,
  loadCommentUntilTop,
  isSnuffComment,
  loadTagsFromComment,
}
