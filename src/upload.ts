import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {read} from './crawler/csv';
import {restaurantParams, restaurantModel} from './model/rest';

dotenv.config({ path: '.env' });

const makeConn = new Promise<void>((res, rej) => {
  mongoose.connect(process.env.mongdburl || '', {
  user: process.env.user,
  pass: process.env.pass,
  dbName: process.env.dbName,
  authSource: process.env.authSource,
  useNewUrlParser: true,
  useUnifiedTopology: true
  }).then((err) => {
    res()
  });
});

const timeout = (ms: number) => {
  return new Promise<void>((res, rej) => {
    setTimeout(() => res(), ms);
  });
}

const upload = async () => {
  await makeConn;

  const data = await read('archieve/result_rest.csv');
  
  data.forEach(async(it, idx) => {
    const item: restaurantParams = {
      name: it.name,
      url: it.url,
      date: new Date(it.date),
      locate: it.locate,
      foodtype: it.foodtype,
      tags: it.tags.split('|'),
      summary: it.summary,
      imgs: it.imgs.split('|'),
      desc: it.desc
    };
    if(it.error !== 'n') {
      return;
    }
    console.log(it.url, idx);
    const res = await restaurantModel.findOne({url: it.url});
    if(!res) {
      console.log("insert", idx);
      await restaurantModel.create(item);
    }
    await timeout(100);
  });
}

function shuffle(array: any[]) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const check = async () => {
  await makeConn;

  const _ans = await restaurantModel.aggregate([
    {$match: {locate: "서울대입구역", foodtype: "한식"}},
    {$sample: {size: 10}}
  ]);
  const ans = shuffle(_ans);
  console.log(ans.length);
  ans.forEach(it => {
    console.log(it.name);
  })
}

if (require.main === module) {
  // upload();
  check();
  process.on('SIGINT', async () => {
    console.log("\nstop");
  });
}
