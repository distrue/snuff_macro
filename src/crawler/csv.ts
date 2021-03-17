const csv = require('csv-parser');
const fs = require('fs');
import {createObjectCsvWriter as createCsvWriter} from 'csv-writer';

export const output = () => {
  return createCsvWriter({
    path: 'result_final.csv',
    header: [
        {id: 'num', title: '번호'},
        {id: 'error', title: '문제여부'},
        {id: 'name', title: '업체명'},
        {id: 'url', title: '링크'},
        {id: 'date', title: '리뷰일자'},
        {id: 'locate', title: '위치'},
        {id: 'foodtype', title: '음식종류'},
        {id: 'tags', title: '태그'},
        {id: 'summary', title: '요약'},
        {id: 'imgs', title: '이미지'},
        {id: 'desc', title: '설명'},
    ]
  });
}

export const read = (filename: string) => {
  const results: any[] = [];
  return new Promise<any[]>((res, rej) => {
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (data: any) => {
        results.push({
          name: data['업체명'],
          url: data['링크'],
          error: data['문제여부'],
          date: data['리뷰일자'],
          locate: data['위치'],
          foodtype: data['음식종류'],
          tags: data['태그'],
          summary: data['요약'],
          imgs: data['이미지'],
          desc: data['설명']
        });
      })
      .on('end', () => {res(results)});
  });
}
