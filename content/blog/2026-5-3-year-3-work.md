---

title: "Year 3 at work and tech"
date: '2026-09-06'
draft: false
slug: 'work-3'
author: 'Aswin'
tags: ['tech', 'work']

---

# Year 3 at work and tech 

Work and tech stuff since last blog post has continued to be around multiple different projects with multiple project titles. It's now 3 years since I started working at this company, and I feel like I've grown a lot in terms of understanding the domain, the enterprise, and the tech stack.

I'm still mostly doing software engineering, but I've been also doing a lot of PM work (identifying problems, talking to stakeholders, understanding the domain, and designing solutions) and a bit of data engineering work (data pipelines and dashboards). This subtle shift got me aware of some more parts of the enterprise and domain, and most importantly, how much solutions are just waiting to be built by someone with the right domain knowledge and agency. And also something about how some things never change and some things just can't be done.

I've become an ardent enthusiast of the enterprise. I've started recognizing how broad and deep things run, my compounding knowledge of the domain, the lasting effects of the work I do, the processes and relationships that already exist that makes work easier, the safety net. So many people working together aligned to a common goal and the scale of it all, is marveling.

## Table of contents
* [Internal tools at work](#internal-tools-at-work)
  * [Software Changes](#software-changes)
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
  * [Sarvam Codex](#sarvam-codex)
* [Other](#other)
* [Future](#future)

# Internal tools at work

In my horizon as someone positioned as a "build-whatever-automation guy" in a pretty big and enterprise company (kind of place where one can claim "nothing ever happens"), I see that the number of ideas and useful tools people have vibecoded internally in my company is overwhelming (to a point where one can now claim some things are happening). A very few folks with esoteric domain knowledge and agency are, in today's words, "cooking with Claude Code". Folks without esoteric domain knowledge are also cooking, perhaps until they hit a bottleneck that has existed for decades.

This is new trend in the internal tools space.

1. ### AI-based Software Changes

This year, I used LLMs for something real. My company's products' release notes had descriptions of what changed for each software version in a table on the official documentation website, but it was on different pages and thus hard to filter and search. I built a small internal tool that scrapes the release notes, uses an LLM to label the changes with pre-existing list of labels, and displays them in a dashboard as structured and searchable data.

As a prototype, I made this on Cloudflare - with workers and D1 (SQLite). You can find that [here](https://fortinet-software-changes.aswincveli.workers.dev/?product=fortigate&from_version_id=45&to_version_id=65&page=3). I used llama-3.3-70b-instruct-fp8-fast as the model for labeling, and just `cheerio` (a popular Node.js library for parsing HTML) to scrape instead of Cloudflare's `/scrape` endpoint, since the release notes were on simple HTML pages. The whole cron-like workflow of scraping, labeling, and storing in D1 was done with a Cloudflare Workflow. The LLM inference was done in batches, with 10 changes/descriptions per batch, with the system prompt containing a list of labels and a description of what each label means for enough context. The LLM inference costed peanuts.

![software changes screenshot](/images/work-3/software-changes.png)

Later in production internally, I used Ministral 3 14b with Ollama for labeling. The UX, this time was interesting as I had to put the human in the loop considering the LLM-predictions may not always be accurate. The project is in a testing phase internally.

I am yet to look into LLM evals and bring more consistency to the labeling.

2. ### Software Assessment report app

My first project at work—an app named Maximus—for a “bug dashboard report generator” entered its third year of service in production. At the time of writing my [previous work blog post](https://aswinc.blog/blog/work-2), it had already become a full-stack web app that parallelly ingested data across endpoints to a serial optimization and filtering pipeline, so work lately was mostly around how to make the filtering pipeline faster. There was a part that sequentially loaded each bug’s webpage on the internal bug tracking platform on selenium which I rewrote using asyncio \+ httpx and made it parallel, bringing down a part that took around 20 minutes to 3 minutes on average.

3. ### Cloud infrastructure for Service Reporting

In Q2 2024, as mentioned in the previous blog, I had built a prototype for a pipeline for automatically generating the service reporting slide deck. The quarterly service report—a slide deck with a bunch of customer-specific metrics like usage trends, money spent, etc., was generated with a time-consuming client-side tool until now. The pipeline I built has two workers: one fetches data from Tableau and ingests it to a SQLite database, and the other writes to a Microsoft Excel workbook template and triggers the VBA code that refreshes the Power Queries and charts. This was put into production from Q4 2024 and probably became the largest data-critical operation I’ve done. Exponential backoff for requests to Tableau, better error logging during refreshing Power Queries, consistency checks to verify whether the VBA and Power Queries ran well – all contributed to better observability and success of the project. This was also the first time I looked into database-related things like query planning and indexing.

<details>  
<summary>Small code exploration:</summary>  

- fetch.py – Connects to a Tableau server, runs parallel API calls to pull various data sets, retries on connection errors, and appends the results to CSV files.    
- sql.py – Reads the generated SQLite databases, writes the data into Excel workbooks for each account, handling data cleaning and one‑by‑one sheet updates.    
- verify_log.py – Parses a fetch.py log, extracts sign‑in retry counts, data‑fetch errors, and workbook errors, then reports timing and status summaries.    
- db_write.py – Converts CSV files in region folders to SQLite tables and processes an accounts CSV, cleaning and exploding user‑ID columns.    
- check_refresh_status.py – Scans XLSM workbooks for a “START” sheet, collects any “Failed” status entries, and outputs a CSV of refresh failures.  
</details>

Something that I didn’t know could work was to run multiple Excel instances in parallel, obviously because they exist in different memory/process ranges.Using xwlings (Python library built on top of win32 to interact with Excel) on our production server, which was a Windows Server with 120GB RAM and 64 cores, we could comfortably run \~8 Excels in parallel without running into COM-related errors. 

4. ### Dashboard for managing product vulnerabilities

Cool dashboard with asset matching dashboard I made when we discovered we could leverage an internal API from the Security Responses team turned out to be quite useful. Instead of eye-balling affected versions of new vulnerabilities, the customer-facing engineers check this dashboard to get a glimpse of their customers’ exposure when a new vulnerability is out. A list of (customer’s) product assets and versions were matched with vulnerabilities’ affected products and versions with a simple iterative product comparison and version containment check.

This has got me thinking about a broader ‘Know Your Customer’ project, ways to understand customers in a data-driven way to manage software changes and vulnerabilities. Maybe for H2 if I’m still there.

5. ### Loadstats

Something I forgot to mention in the last blog posts was a browser plugin \+ dashboard I built as a personal side project at work in 2023 still works and is used by 25+ support engineers in APAC to track a efforts they put on a specific kind of tickets. This is very heartwarming to witness. Of course, I had to do some chores and take database backups last year, but since it’s lean and mean, nothing really happens. The stack has MongoDB and FastAPI, and was my first time really working on a NoSQL database.

6. ### Local server infrastructure at work

Our automation team’s own compute infrastructure was approved and a Dell rack was delivered a few months back. I’m adding that here, as installing it in our own data lab/datacenter was a first for me – fixing the rack, wires, configuring the network and RAIDs, etc. We’ve put Proxmox (type 1 \- baremetal hypervisor) plus Windows on top of it for now. We’d need to migrate Loadstats and other applications on a Linux VM on this later. It was also the first time setting up nginx and routing many apps to their statically built web apps and APIs.

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

Around September, my flatmate was convinced that we can now generate so much more insights from football match broadcast videos as vision language models have progressed so much. For the experience, I thought I’ll look into it and see how to build something like that.

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

## Sarvam Codex

In late April, I cancelled my Claude Pro subscription to explore more cost-effective alternatives. Initial trials with OpenCode and popular models like DeepSeek, Gemini Flash, and other models worked well even for long-context tasks but proved expensive. I then tested Sarvam's Sarvam-105B and was impressed by its Claude 3.5 sonnet-like performance relative to cost. Integration of Sarvam with Opencode required a custom proxy since Sarvam's ChatCompletions API accepts only strings rather than arrays (unlike the OpenAI specification). Even though the performance was satisfactory, Sarvam 105-b exhibited inefficiencies with XML-based tool calls, frequently generating incorrect schema and wasting some tokens. This and general curiosity prompted me to fork OpenAI's Codex to develop a harness just for Sarvam. Another inspiration was, I'd love if there was an Indian alternative coding model I could use (I'm particularly interested in evaluating Sarvam's upcoming coding model).

<blockquote class="twitter-tweet" data-media-max-width="560" data-dnt="true"><p lang="en" dir="ltr">🤔plugging Sarvam&#39;s API straight didn&#39;t work apparently because its ChatCompletions only accepts strings and not an array of strings (latter is the OpenAI spec?). Made a small proxy which flattens those out, pointed OpenCode to that, and now it&#39;s working. Lemme see how it feels. <a href="https://t.co/LOHPszLwfW">pic.twitter.com/LOHPszLwfW</a></p>&mdash; aswin c (@chandanaveli) <a href="https://x.com/chandanaveli/status/2049371024920338798?ref_src=twsrc%5Etfw">April 29, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script> 

But Sarvam 105-b isn't good enough for coding tasks and hallucinates a lot. So, that's where the state of Indian agentic coding sits currently.

<blockquote class="twitter-tweet" data-media-max-width="560" data-dnt="true"><p lang="en" dir="ltr">But Sarvam 105-b isn't good enough for coding tasks and hallucinates a lot. <a href="https://x.com/chandanaveli/status/2083179206226198644?s=20">pic.twitter.com/LOHPszLwfW</a></p>&mdash; aswin c (@chandanaveli) <a href="https://x.com/chandanaveli/status/2083179206226198644?s=20">April 29, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>

Currently, I'm using Opencode Go for my coding tasks.

---

A quote that stays in my mind our new whole vibe coding and AI era is:

<blockquote class="twitter-tweet" data-media-max-width="560">
<p lang="en" dir="ltr">you can outsource your thinking<br>but you cannot outsource your understanding</p>
&mdash; kache (@yacineMTB) <a href="https://twitter.com/yacineMTB/status/2018886083120153046?ref_src=twsrc%5Etfw">February 4, 2026</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

# Future

* “IDK bro”  
* I’m thinking more about adoption and enablement. There's really a lot of tech now and less people to make sense of it it by talking and showing it to people. Also wondering whether I can flourish in another part of the enterprise, like in a more product-facing team or sales.

Let’s see what happens this year!
—  

