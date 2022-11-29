var fs = require('fs');
var array = fs.readFileSync('links').toString().split("\n");
const cheerio = require('cheerio');
const request = require('request-promise');
const needle = require('needle');
const results = [];
let count = 0;

async function init() {
    for (i in array) {
        const $ = await request({
            uri: array[i],
            transform: body => cheerio.load(body)
        });
        const tags = $('meta[property="og:video:tag"]').toArray().map((x) => { return $(x).attr('content')});
        function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
        }

        // console.log(tags)
        // console.log('tags', tags.map( (x)=> {return x.match(/[0-9]/)?'':x} ) );
        // const tag = tags
        //     .map( (x)=> {return x.match(/[0-9]/)?'':x} )
        //     .filter(onlyUnique)
        //     .toString()
        //     .replace('(', '')
        //     .replace(')','')
        //     .replace(/,/g, ' ')
        //     .replace('    ', ' ')
        //     .replace('   ', ' ');
        const tag = tags
            .map( (x)=> {return x.match(/[0-9]/)?'':x} )
            .map( (x) => {return x.split(" ")})
            .flat()
            .filter(onlyUnique)
            .toString()
            .replace('(', '')
            .replace(')','')
            .replace(/,/g, ' ')
            .replace('    ', ' ')
            .replace('   ', ' ');
        const title = $('meta[property="og:title"]').attr('content');
        const thumbnail = $('meta[name="twitter:image"]').attr('content');
        const lowthumbnail = thumbnail.replace('maxresdefault', 'hqdefault');
        const video_id = thumbnail.split('/')[4];
        const iframe = `https://www.youtube.com/embed/${video_id}`;
/*
        const script = $('script')[0];
        const func = script.children[0].parent.children[0].data;
        const obj = func.slice(44).slice(0, -1);
        const tags = JSON.parse(obj)
        const tag = tags.data.video_tags.toString().replace(/,/g, ' ');


        const videoScript = $('#video-player-bg > script:nth-child(6)').html();
        const thumb69 = videoScript.match('html5player.setThumbUrl169\\(\'(.*?)\'\\);' || [])[1];
        const thubnail = thumb69.replace(/lll|poster/g, "ll"); // < HERE WE CAN CHANGE THE THUMBNAIL SIZE from "l" "ll"
*/


        const segments = new URL(array[i]).pathname.split('/');
        const last_url_segment = segments.pop() || segments.pop(); // Handle potential trailing slash
        console.log(last_url_segment);
        const date = new Date().toISOString();
        /*
        const idFrame = segments[1].slice(5);
        const prep = 'https://www.xvideos.com/embedframe/';

        const last_url_segment = segments.pop() || segments.pop(); // Handle potential trailing slash

        */
        const data =
`---
layout: post
title: |
    ${title}
category: video
date: ${date}
tags: ${tag}
thumbnail: ${lowthumbnail}
iframe: ${iframe}
---
`;
        console.log(data);
        console.log(i);
        fs.writeFileSync(`_posts/${date.substring(0,10)}-${count}${video_id.replace('-','a')}.markdown`, data);
        count++;
    }

}
init();