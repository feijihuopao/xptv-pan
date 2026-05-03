// XPTV Source: 多多影音
const BASE = 'https://tv.yydsys.top';

async function getLocalInfo() {
  return jsonify({ ver: 1, name: '多多影音', api: 'duoduo', type: 3 });
}

async function getConfig() {
  return jsonify({
    ver: 1,
    title: '多多影音',
    site: BASE,
    tabs: [
      { name: '電影', ext: { id: 1 } },
      { name: '劇集', ext: { id: 2 } },
      { name: '短劇', ext: { id: 5 } },
      { name: '動漫', ext: { id: 4 } },
      { name: '綜藝', ext: { id: 3 } },
      { name: '紀錄', ext: { id: 20 } },
    ]
  });
}

async function getCards(ext) {
  ext = argsify(ext);
  const page = parseInt(ext.page || 1);
  const { id, filters = {} } = ext;

  let url = `${BASE}/index.php/vod/show/id/${id}/page/${page}.html`;

  if (filters.class && filters.class !== '') {
    url = `${BASE}/index.php/vod/show/id/${id}/class/${filters.class}/page/${page}.html`;
  }
  if (filters.area && filters.area !== '') {
    url = `${BASE}/index.php/vod/show/id/${id}/area/${encodeURIComponent(filters.area)}/page/${page}.html`;
  }
  if (filters.lang && filters.lang !== '') {
    url = `${BASE}/index.php/vod/show/id/${id}/lang/${encodeURIComponent(filters.lang)}/page/${page}.html`;
  }
  if (filters.year && filters.year !== '') {
    url = `${BASE}/index.php/vod/show/id/${id}/year/${filters.year}/page/${page}.html`;
  }

  const resp = await $fetch.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' }
  });
  const html = resp.data;
  const cheerio = createCheerio();
  const $ = cheerio.load(html);

  const items = [];
  $('#main .module-item').each((_, e) => {
    const href = $(e).find('.module-item-pic a').attr('href');
    const title = $(e).find('.module-item-pic img').attr('alt');
    const pic = $(e).find('.module-item-pic img').attr('data-src');
    const remark = $(e).find('.module-item-text').text();

    items.push({
      vod_id: href,
      vod_name: title,
      vod_pic: pic,
      vod_remarks: remark,
      ext: { url: BASE + href }
    });
  });

  return jsonify({
    list: items,
    page: page,
    filter: [
      {
        key: 'class',
        name: '类型',
        init: '',
        value: [
          { n: '全部', v: '' },{ n: '剧情', v: '剧情' },{ n: '喜剧', v: '喜剧' },{ n: '动作', v: '动作' },{ n: '爱情', v: '爱情' },{ n: '科幻', v: '科幻' },{ n: '恐怖', v: '恐怖' },{ n: '犯罪', v: '犯罪' },{ n: '悬疑', v: '悬疑' },{ n: '惊悚', v: '惊悚' },{ n: '动画', v: '动画' },{ n: '战争', v: '战争' },{ n: '古装', v: '古装' },{ n: '历史', v: '历史' }
        ]
      },
      {
        key: 'area',
        name: '地区',
        init: '',
        value: [
          { n: '全部', v: '' },{ n: '大陆', v: '大陆' },{ n: '香港', v: '香港' },{ n: '台湾', v: '台湾' },{ n: '美国', v: '美国' },{ n: '日本', v: '日本' },{ n: '韩国', v: '韩国' },{ n: '英国', v: '英国' },{ n: '法国', v: '法国' },{ n: '德国', v: '德国' },{ n: '泰国', v: '泰国' },{ n: '印度', v: '印度' }
        ]
      },
      {
        key: 'lang',
        name: '语言',
        init: '',
        value: [
          { n: '全部', v: '' },{ n: '国语', v: '国语' },{ n: '粤语', v: '粤语' },{ n: '英语', v: '英语' },{ n: '日语', v: '日语' },{ n: '韩语', v: '韩语' }
        ]
      },
      {
        key: 'year',
        name: '年份',
        init: '',
        value: [
          { n: '全部', v: '' },{ n: '2026', v: '2026' },{ n: '2025', v: '2025' },{ n: '2024', v: '2024' },{ n: '2023', v: '2023' },{ n: '2022', v: '2022' },{ n: '2021', v: '2021' },{ n: '2020', v: '2020' },{ n: '2019', v: '2019' },{ n: '2018', v: '2018' },{ n: '2017', v: '2017' },{ n: '2016', v: '2016' },{ n: '2015', v: '2015' },{ n: '2010-2015', v: '2010' },{ n: '2006-2010', v: '2006' }
        ]
      }
    ]
  });
}

async function getTracks(ext) {
  ext = argsify(ext);
  const url = ext.url;
  if (!url) return jsonify({ list: [] });

  const resp = await $fetch.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' }
  });
  const html = resp.data;
  const cheerio = createCheerio();
  const $ = cheerio.load(html);

  const tracks = [];
  $('.module-player-list .module-row-one').each((_, e) => {
    const name = $(e).find('.module-row-title h4').text().replace('- 公众号《多多影音》', '').trim();
    const panShareUrl = $(e).find('.module-row-title p').text();
    tracks.push({ name: name, pan: panShareUrl });
  });

  return jsonify({ list: [{ title: '默认', tracks }] });
}

async function getPlayinfo(ext) {
  return jsonify({ urls: [] });
}

async function search(ext) {
  ext = argsify(ext);
  const keyword = ext.text || '';
  if (!keyword) return jsonify({ list: [] });

  const page = parseInt(ext.page || 1);
  const url = `${BASE}/index.php/vod/search/page/${page}/wd/${encodeURIComponent(keyword)}.html`;

  const resp = await $fetch.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' }
  });
  const html = resp.data;
  const cheerio = createCheerio();
  const $ = cheerio.load(html);

  const items = [];
  $('#main .module-search-item').each((_, e) => {
    const href = $(e).find('.video-info-header h3 a').attr('href');
    const title = $(e).find('.module-item-pic img').attr('alt');
    const pic = $(e).find('.module-item-pic img').attr('data-src');
    const remark = $(e).find('.video-serial').text();

    items.push({
      vod_id: href,
      vod_name: title,
      vod_pic: pic,
      vod_remarks: remark,
      ext: { url: BASE + href }
    });
  });

  return jsonify({ list: items, page });
}
