import dotenv from 'dotenv';
import {read, output} from './crawler/csv';
import { summaryParser, titleParser } from './crawler/parser';
import Hooks, { loadImage, isLastImage } from './crawler/puppeteer-hooks';
   
dotenv.config({ path: '.env' });

var data: any[];

const csvWriter = output();

const main = async () => {
  data = await read('from.csv');
  
  const page = await Hooks.loadPage();
  await Hooks.loginInstagram(page);

  // scroll to specific page
  /*
  const scrollTime = 16;
  for(var idkx = 0; idkx < scrollTime; idkx += 1) {
    await page.evaluate(`window.scrollTo(0, ${2000 * idkx})`);
    await page.waitForTimeout(1000 * 2);
  }
  */

  await page.click("#react-root > section > main > div > div._2z6nI > article > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(1)");

  var idx = 0;
  var title: string = '';
  while(await Hooks.isLastPost(page, idx) === false) {
    console.log("item " + idx);
    idx += 1;
    try {
      await page.waitForTimeout(2000);
      // no more smaller val! consider about HTTP 429
      
      const url = page.url();
      const isExists = data.findIndex((it) => { 
        if(it.url === url) return true; 
        return false;
      });
      if(isExists !== -1) {
        if(data[isExists].error === 'n' 
          || data[isExists].error === 'Error: not review'
          || data[isExists].error === 'Error: please write tags') {
          await csvWriter.writeRecords([data[isExists]]);
          continue;
        }
        console.log(data[isExists].error, data[isExists].name);
      }

      var review = await Hooks.getReview(page);
      if(!review) continue;
      console.log("find review");

      var title = "";
      const par_t = titleParser(review);
      title = par_t.title;
      review = par_t.review;
      console.log("find title");
      
      var summary = '준비중이에요!';
      const par = summaryParser(review, summary);
      review = par.review;
      summary = par.summary;
      console.log("find summary");
      
      var datetime = await Hooks.getDatetime(page);
      console.log("find detail");
      
      var tags: any[] = [];
      var commIdx = 2;
      await Hooks.loadCommentUntilTop(page);
      while(true) {
        var look = await Hooks.isSnuffComment(page, commIdx);
        if(look === true) {
          tags = await Hooks.loadTagsFromComment(page, commIdx);
          if(tags.length > 0) break;
        }
        commIdx += 1;
        if(commIdx > 800) {
          console.log("tag find problem");
          throw Error("cannot find tags!");
        }
      }
      console.log(commIdx, tags.length);

      var cutout = tags.filter((it) => it.includes('#스누푸파_'));
      cutout = cutout.map(it => it.replace('#스누푸파_', ''));
     
      var locate = '';
  
      const foodTypeCandi = ["한식", "양식", "일식", "중식", "디저트", "카페", "알콜", "그외"];
      var _foodtype = cutout.filter((it) => foodTypeCandi.includes(it));
      var foodtype = '';
      if(_foodtype.length === 0) foodtype = '';
      else foodtype = _foodtype[0];
  
      const locateCandi = ["녹두", "서울대학교", "서울대입구역", "신림", "봉천", "샤로수길", "낙성대", "행운동", "사당"];
      var _locate = cutout.filter((it) => locateCandi.includes(it));
      var locate = '';
      if(_locate.length === 0) locate = '';
      else locate = _locate[0];
  
      var imgs: string[] = [];
      var imgcnt = 0;
      while(await isLastImage(page) === false) {
        imgcnt += 1;    
        const img = await loadImage(page, imgcnt);
        if(img) imgs.push(img); 
      }
      console.log("imgcnt: " + imgcnt);

      await csvWriter.writeRecords([{
        num: idx,
        name: title,
        date: datetime,
        locate: locate,
        foodtype: foodtype,
        tags: tags.reduce((prev, now) => prev + '|' + now),
        imgs: imgs.reduce((prev, now) => prev + '|' + now),
        summary: summary,
        desc: review,
        url: page.url(),
        error: 'n'
      }]);
    }
    catch(err) {
      console.log("error occured" + err);
      await csvWriter.writeRecords([{
        num: idx,
        name: title,
        url: page.url(),
        error: err
      }]);
    }
  }
  console.log("parsed all content");
}

if (require.main === module) {
  main();
  process.on('SIGINT', async () => {
    console.log("\nstop");
  });
}
