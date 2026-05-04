---

title: "Year 3 at work and tech"
date: '2026-05-03'
draft: false
slug: 'work-3'
author: 'Aswin'
tags: ['tech', 'work']

---

# Year 3 at work and tech 

Work and tech stuff since last blog post has continued to be around multiple different projects with multiple project titles. Now, it's 3 years since I started working at a company, so it was time to collect and write down everything I’ve been working on in the past year to see where I’m at. This blog is kind of a draft, still.

## Table of contents
* [Internal tools at work](#internal-tools-at-work)
  * [Software Assessment report app (Maximus)](#software-assessment-report-app-maximus)
  * [Cloud infrastructure for Service Reporting](#cloud-infrastructure-for-service-reporting)
  * [Dashboard for product vulnerabilities](#dashboard-for-product-vulnerabilities)
  * [Loadstats](#loadstats)
  * [Local server infrastructure at work](#local-server-infrastructure-at-work)
* [B2B stuff at work](#b2b-stuff-at-work)
* [Side projects and other](#side-projects-and-other)
  * [tweetlists.app](#tweetlistsapp)
  * [Bootstrat](#bootstrat)
  * [RAGs](#rags)
* [Future](#future)

# Internal tools at work

1. ### Software Assessment report app

My first project at work—an app named Maximus—for a “bug dashboard report generator” entered its third year of service in production. At the time of writing my [previous work blog post](https://aswinc.blog/blog/work-2), it had already become a full-stack web app that parallelly ingested data across endpoints to a serial optimization and filtering pipeline, so work lately was mostly around how to make the filtering pipeline faster. There was a part that sequentially loaded each bug’s webpage on the internal bug tracking platform on selenium which I rewrote using asyncio \+ httpx and made it parallel, bringing down a part that took around 20 minutes to 3 minutes on average.

2. ### Cloud infrastructure for Service Reporting

In Q2 2024, as mentioned in the previous blog, I had built a prototype for a pipeline for automatically generating the service reporting slide deck. The quarterly service report—a slide deck with a bunch of customer-specific metrics like usage trends, money spent, etc., was generated with a time-consuming client-side tool until now. The pipeline I built has two workers: one fetches data from Tableau and ingests it to a PostgreSQL database, and the other writes to a Microsoft Excel workbook template and triggers the VBA code that refreshes the Power Queries and charts. This was put into production from Q4 2024 and probably became the largest data-critical operation I’ve done. Exponential backoff for requests to Tableau, better error logging during refreshing Power Queries, consistency checks to verify whether the VBA and Power Queries ran well – all contributed to better observability and success of the project.

<details>  
<summary>Small code exploration:</summary>  

- fetch.py – Connects to a Tableau server, runs parallel API calls to pull various data sets, retries on connection errors, and appends the results to CSV files.    
- sql.py – Reads the generated SQLite databases, writes the data into Excel workbooks for each account, handling data cleaning and one‑by‑one sheet updates.    
- verify_log.py – Parses a fetch.py log, extracts sign‑in retry counts, data‑fetch errors, and workbook errors, then reports timing and status summaries.    
- db_write.py – Converts CSV files in region folders to SQLite tables and processes an accounts CSV, cleaning and exploding user‑ID columns.    
- check_refresh_status.py – Scans XLSM workbooks for a “START” sheet, collects any “Failed” status entries, and outputs a CSV of refresh failures.  
</details>

Something that I didn’t know could work was to run multiple Excel instances in parallel, obviously because they exist in different memory/process ranges.Using xwlings (Python library built on top of win32 to interact with Excel) on our production server, which was a Windows Server with 120GB RAM and 64 cores, we could comfortably run \~8 Excels in parallel without running into COM-related errors. 

3. ### Dashboard for product vulnerabilities

Cool dashboard with asset matching dashboard I made when we discovered we could leverage an internal API from the Security Responses team turned out to be quite useful. Instead of eye-balling affected versions of new vulnerabilities, the customer-facing engineers check this dashboard to get a glimpse of their customers’ exposure when a new vulnerability is out. A list of (customer’s) product assets and versions were matched with vulnerabilities’ affected products and versions with a simple iterative product comparison and version containment check.

This has got me thinking about a broader ‘Know Your Customer’ program, ways to understand customers in a data-driven way to manage software changes and vulnerabilities. Maybe for H2 if I’m still there.

4. ### Loadstats

Something I forgot to mention in the last blog posts was a browser plugin \+ dashboard I built as a personal side project at work in 2023 still works and is used by 25+ support engineers in APAC to track a special kind of effort. This is very heartwarming to witness. Of course, I had to do some chores and take database backups last year, but since it’s lean and mean, nothing really happens. The stack has MongoDB and FastAPI, and was my first time really working on a NoSQL database.

5. ### Local server infrastructure at work

Our automation team’s own compute infrastructure was approved and a Dell was delivered a few months back. I’m adding that here, as installing it in our own data lab/datacenter was a first for me – fixing the rack, wires, configuring the network and RAIDs, etc. We’ve put Proxmox (type 1 \- baremetal hypervisor) plus Windows on top of it for now. We’d need to migrate Loadstats and other applications on a Linux VM on this later.

# B2B at work

A lot of big and small useful tools were shipped B2B, but the best project was a wrapper for managing high-availability firewall clusters. For a Malaysian telecom, we delivered a CLI tool (and then a web app) to connect to firewall high availability devices, easily change HA priorities to trigger a failover and run a healthcheck. This idea of doing something and then doing a health check – is going to stay with me as a software design principle because of this project.

…  
And a lot more.

# Side projects and other

## tweetlists.app

This year, I brought some more design and usability improvements, such as searchability of lists, to tweetlists \- a web app I made in 2025 to easily share a list of tweets. One of the users and my friend \- Debadree (local Tweetlist enthusiast) \- also helped out with improving the design.

![tweetlists.app screenshot](/images/work-3/tweet-lists.gif)

Again, it’s nice and heartwarming to have an actual app on the internet that I made and use frequently.

It still sits on Vercel and a Neon database. I thought about migrating it to Cloudflare and D1, but I didn’t check it out so much.

## Bootstrat

Around September, my flatmate was convinced that we can now generate so much more insights from football match broadcast videos as vision language models have progressed so much. So, for funsies, I thought I’ll look into it, see how to build something like that.

The open question for us was, how reliably can you create an accurate top-down view of the football field from a match broadcast that we see on TV, with tech that’s out there. And we decided to break it down into two: 1\) track objects on the screen 2\) identify players. 

Turns out, people have tried hard enough to track objects from football broadcast video and have built pre-trained object recognition models which can detect and assign IDs to players, referees, and the ball and track them over frames. They basically classify objects into different classes with a confidence ratio. We found a YOLO-architecture model online that tracks football players, referees and the ball (into classes) – [Eagle](https://github.com/nreHieW/Eagle/tree/main) – and played around that for a while.

To see how well we can identify players, we wanted to detect jersey numbers from the back of players during play. This is a hard problem because of the angles, the quality of the video, and the fact that the numbers are not always fully visible. So, I tried fine-tuneing deepseek-v3 (vision). This was done using unsloth, who already had a [blog and a notebook](https://unsloth.ai/docs/models/tutorials/deepseek-ocr-how-to-run-and-fine-tune) on finetuning Deepseek. You can do it on one GPU on Google Colab\!. I got a dataset of labelled football jerseys of players during play [from Soccernet](https://universe.roboflow.com/search?q=soccernet-jersey).  Other than regular software plumbing, all I had to do really was to change the nature of the dataset (of crops of football players’ back during play) to Deepseek’s conversational format and make sure that the crops are sized in the right dimensions while going for inference:

![deepseek jersey detection result](/images/work-3/deepseek-result.png)

Not bad!

Well, we kind of stopped there and didn’t really get anywhere enough to challenge the incumbents of sports analysis, but it was my first time playing with LoRa, GPUs, and finetuning.

## RAGs

Obviously, I always wanted to make my own RAG and see how well it’d do so I ended up making one with the knowledge of my current company’s product documentation and community forum.

On the first leg, I handcrafted the scrapers myself for the docs and community forums using beautifulsoup and used ChromaDB (for vector storage):

![ChromaDB RAG interface](/images/work-3/rag-search-1.png)

Later, with Gemini 2.0-flash through OpenRouter, the results st, This was entirely done on Google Collab and was the first time I used an LLM for something remotely useful and also see good vector searches are:

![Gemini 2.0-flash RAG results](/images/work-3/rag-search-2.png)  
—

Later, I tried it with Cloudflare’s ‘AI Search’, which is their managed RAG solution. I was drawn by their [first blog post](https://blog.cloudflare.com/introducing-autorag-on-cloudflare/) of the service.

Cloudflare really does have all you need to build a custom RAG at scale right now. The ‘Browser Run’ service has endpoints such as /scrape, /crawl (scrapes content from a starting URL and writes back in Markdown), /links (to get links from a page), /markdown (Extract markdown from a page). So, if the knowledge you want to put in your RAG is out there on the web as text, you can just point and let the Cloudflare Worker do its job with all these endpoints. I used /links to get a list of URLs I want to scrape and passed it to crawl and wrote the results to an R2 bucket (object storage like AWS S3).

You can simply point ‘AI Search’ (the RAG service) to an R2 bucket and it’ll do all kinds of vectorizing and indexing for you. And in ‘AI Search’ service, you can set and configure how we want to do query rewrite (which model), retrieval (match threshold, similarity caching), re-ranking \- and such things.

![Cloudflare AI Search RAG configuration](/images/work-3/cloudflare-rag.png)

Lastly, it’s so cheap. It has only cost 0.75$ so far even though my initial crawler went haywire and ran an extra couple of hours\!

# Other 

## AI tools

I didn’t pay for any AI tools other than Claude Pro, which in mid 2025 started coming with Claude Code, but I was curious about everything new that was popping up. So, I once checked out [Lovable](http://lovable.com) to see how easy the ‘human in the loop’-ness  looks like. For a time, I used to always have Perplexity open as a tab but now, Google AI is also quite effective at finding answers and at whatever we used to go to Perplexity for.

A quote that stays in my mind our new whole vibe coding and AI era is:

<blockquote class="twitter-tweet" data-media-max-width="560">
<p lang="en" dir="ltr">you can outsource your thinking<br>but you cannot outsource your understanding</p>
&mdash; kache (@yacineMTB) <a href="https://twitter.com/yacineMTB/status/2018886083120153046?ref_src=twsrc%5Etfw">February 4, 2026</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

Currently, I’m using Sarvam as the default coding agent because it’s so cheap (only ₹4/1M token even for their 105B model) and good enough.

<blockquote class="twitter-tweet" data-conversation="none" data-media-max-width="563">
<p lang="en" dir="ltr">🤔plugging Sarvam's API straight didn't work apparently because its ChatCompletions only accepts strings and not an array of strings (latter is the OpenAI spec?). Made a small proxy which flattens those out, pointed OpenCode to that, and now it's working. Lemme see how it feels. <a href="https://t.co/LOHPszLwfW">pic.twitter.com/LOHPszLwfW</a></p>
&mdash; aswin c (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/2049371024920338798?ref_src=twsrc%5Etfw">April 29, 2026</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

# Future

* “IDK bro”  
* I’m thinking more about adoption and enablement. There's really a lot of tech now and less people to enable it by talking and showing it to people. I see a lot of AI companies (model companies) are becoming consulting companies a bit, too.  
* I feel the ecosystem lacks great new products at the moment and it’s draining morale. More money’s getting sucked into AI and it’s having more than just second order effects on the economy.  
* Understanding more about big companies. Apparently, some folks in big companies really want to do things. I’m becoming a ‘big company enjoyer’ as much as I’m a ‘small company enthusiast’.

Let’s see what happens this year!  
—  

