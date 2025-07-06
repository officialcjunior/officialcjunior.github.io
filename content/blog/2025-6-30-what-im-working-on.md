---
title: "What I'm working on – at work and at side"
date: '2025-06-30'
draft: false
slug: 'work-2'
author: 'Aswin'
tags: ['tech', 'work']
---

<style>
mark {
  background-color: #ffc266;
  color: black;
}
yellowmark {
  background-color: #ffffb3;
  color: black;
}
</style>

In March 2025, I felt like considering to do something:

<div style="display: flex; justify-content: center; width: 100%; margin: 20px 0;">
  <blockquote class="twitter-tweet"><p lang="en" dir="ltr">Considering to expand and merge a couple of my drafts:<br><br>1. Draft titled &quot;Design, analysis, and operations of my (internal) app&quot; (Web apps, software engineering, browser automation, SAML, polling, animations)<br>2. Drafts about the internal server infrastructure I built for…</p>&mdash; aswin c (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1899700332588101785?ref_src=twsrc%5Etfw">March 12, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>
<div>

Work life has been revolving around N different projects with N different project titles, as I wanted it to be. So, this blog post will have a logbook-like format and is like a progress report. I just wanted to write this down before I forget all of this.

---

## Table of contents
* [Internal tools at work](#internal-tools-at-work)
  * [Maximus](#maximus)
  * [Service Reporting tool](#service-reporting-tool)
* [B2B stuff at work](#b2b-stuff-at-work)
* [Side projects](#side-projects)
  * [tweetlists.app](#tweetlistsapp)
  * [tiles.run](#tilesrun)
* [Future](#future)

---

# Internal tools at work

1. ## Maximus

### Design, analysis, and operations 

My first responsibility at work was to make an app—named Maximus—for a “bug dashboard report”. At the time of writing my \[previous work blog\](https://aswinc.blog/blog/work-1) post, it was just a static web app which merged and filtered some CSV data and wrote it to an Excel workbook template. A lot of things such as getting those CSV files were still manual. This has changed, and Maximus is now a full-stack single-click monster web app housing numerous mysteries that even its sole creator (me) can’t often unravel.

To an outsider, it may feel like Maximus has instrumental system design built in, but it’s just another app that grew along the timeline from a simple system that worked. Nevertheless, I see Maximus as a hallmark and a monument of the first generation of useful software I built at a workplace, and also the first generation of homebrewed internal tools inside the global “premium support team” I’m part of at my work.

I’m just going to casually throw you the function call graph of Maximus:


Notably, there’s two things happening.

`/generate_report_step_1()` API receives the user input from the landing page. According to the input, It launches a few threads—to fetch information from various places, such as our Engineering’s bug tracking tool, and a couple other teams’ APIs in parallel. Some browser emulation and normal SSO+REST API is done here, as the company is run by different teams (the world is also run by different people) with different choices. Maximus also takes rarely updated information from a few data warehouses various operations team seldom updates with, and finally displays a summary of what was fetched from various sources for the user to review.

`/generate_report_step_2()` API is all about optimization. A lot of clever and static algorithms such as `removeResolved()`, `removeKeywords()` work serially to finetune the information and remove bugs that are not relevant to the customer’s configuration of our product. This is the part where a lot of discussions and testing had to be done with team leaders worldwide, as optimization never be perfect and a few bugs could always be missed. We now operate at around 40% removal of records compared to the way this was done before, which translates to around 2 hours saved for the customer-facing engineer before he delivers it to the actual partner or customer. That’s probably a lot of “lives saved”, through the lens of Steve Jobs:


Link: [https://folklore.org/Saving\_Lives.html](https://folklore.org/Saving_Lives.html)

Later, `/display_conflics_form()` displays a few differences of information from the bug tracking tool and a crowdsourced database from the customer-facing engineers, so that the user can choose the kind of information to show up on the report, and finally lets the user download the report. A copy of the final report is pushed and stored in a folder in Sharepoint with some help from Microsoft Power Automate.

There’s /check\_progress() that’s doing some regular polling and serving some client-specific progress all the time. Right now, it’s just a function on the global scope.

Of course, cosmetic and report-template-specific incremental changes and improvements happen all the time. For example, we’re currently considering moving some information to another page and making a ‘key metrics’ sheet on the report for a top-level viewpoint. But as long as the deliverable doesn’t change drastically, the core software infrastructure of Maximus should likely stay the same. Therefore, I believe it might endure decades, as Stripe CEO Patrick Collison suggests when talking about a few “generational APIs” of his company:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">&quot;It&#39;s interesting that API design doesn&#39;t get more study as a discipline.<br><br>When you get API architecture right, it can be so enduring over literally multiple decades.<br><br>Even in the face of frenzied evolutions in everything around it.&quot;<br><br>- <a href="https://twitter.com/patrickc?ref_src=twsrc%5Etfw">@patrickc</a><br><br>Full episode tomorrow <a href="https://t.co/KNREym0kRX">pic.twitter.com/KNREym0kRX</a></p>&mdash; Dwarkesh Patel (@dwarkesh_sp) <a href="https://twitter.com/dwarkesh_sp/status/1760009263110598752?ref_src=twsrc%5Etfw">February 20, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

### People and the team

Maximus has left me feeling I delivered this project 0→1: I’ve led it, scaled it, seen my “brilliant solutions” become tech debt, etc., not only technically but also strategically, such as in discovering the next step and plan, the people to talk to, the kind of impression the team should keep, etc. The responsibility was and is still heavy, as the correctness of the app and the report is business critical. But thankfully, we’ve made zero customer-critical errors so far. And for the past 12+ months, this has just worked.

`<blockquote class="twitter-tweet"><p lang="en" dir="ltr">this is also a big mindset shift that researchers coming into swe have to experience. in research, you do a bunch of stuff and then ship a static, complete artifact — the research paper (+ code). you move on.<br><br>in SWE you ship the living system and you have to keep it alive</p>&mdash; Linus (@thesephist) <a href="https://twitter.com/thesephist/status/1891327111115190450?ref_src=twsrc%5Etfw">February 17, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>` 

On the process side, my teammate has worked on various new ways of delivering this deliverable differently based on periodicity, incrementalism, and consolidation. It is still interesting to see how an actual deliverable is eventually born from discussions and narratives that start from a random afternoon’s coffee table.

Personally, I feel I undervalue the impact of this thing: the report might be sitting on the desks of multiple notable global skylines, world’s chip manufacturers, top banks, and many other places where a lot of other important decisions are made. The report Maximus churns out costs 10x more than your wildest guess and my company makes a lot of money with this. And, according to the data, the premium customers mostly buy it 3-4 times a year and we’re sending out \~4.3 reports a business day. B2B SaaS is unreal and still where a lot of the money is.

2. ## Service Reporting tool

The quarterly service report—a slide deck with a bunch of customer-specific metrics like usage trends, money spent, etc—was something assigned to the team I’m in to own and operate since mid 2024, as the guy who used to run it since the global umbrella team’s inception retired and probably moved to someplace closer to the Mediterranean. Moreover, everyone knew it was centralized, used a very old tech stack, and was quite unmaintainable.

Since we couldn’t change how the final deck looks, we couldn’t move away from Microsoft. Therefore, the tech stack of this thing is a bit old school: Microsoft Excel, VBA (Visual Basic for Applications) and Power Query. And the pipeline goes something like: fetch data from Tableau using Tableau API Excel Macros, filter and process using Power Query, use the pivot charts and tables to draw the charts, and finally use Macros again to copy them into the report slide template—all on the user-side.

Here, I built the slide generation part of the project—the part where the charts and tables are copied to the slide template—had to come up a few clever checks to deal with blank slides, blank tables, small tables, etc., all of which has merrily worked well for all our global engineers and managers for the past 2 quarters.

Later in Q2 2024, I built a sort of “server version” which generates these reports for all customers. This was a pipeline that fetches data from Tableau, writes it to an sqlite database, fills the Microsoft Excel template, and triggers the VBA code which refreshes the Power Queries and charts. Xlwings was the Python library at the heart of this pipeline—a library built on top of Win32 APIs—which let me interact with Excel Macros through Python. This hasn’t been used in production for its intended use, but the database was found to have another use \- to act as a performant source for some dashboarding and analytics, which was so cool that it made all the way up to the Vice President on the recent leadership summit.

### People and the team

The best part of this was working with a senior engineer from the U.S, who sits on top of years of organizational knowledge and raw tinkering skill. I saw how shipping (software) by itself is a signal—on how you just ship the software, see how people react, and lead it from there, rather than wait for a general consensus, gather too many opinions, or get stuck in your own head. 

I still think the team is extremely lean: as we’re just a team of one 10x engineer (mentioned above), two 1-x engineers (me and my co-worker from Bangalore), a relationship manager (who talks to the wider team, gathers information, seldom takes “executive decisions”), and a program manager (rationalist, bureaucrat) to send the right e-mails and defend against the dark arts. It’s a joy to be able to execute well and fast.

It was fun to walk around one day and see a couple of folks trying to figure out the tool and see the report getting generated on their screen. The feeling of seeing something you made running in the wild never gets old.

# B2B stuff at work

There’s no one way to make sure a software upgrade of network devices such as firewalls went well—there’s many. Some folks just want a tool to fetch a lot of data from their firewalls (one of our products) and put it in an Excel file so that they can easily see whether something needs more attention—and that’s something I did. Writing to an Excel file was obviously with openpyxl – the best Python framework for working with Excel files. Later, I “vibecoded” a pretty cool comparison algorithm which could compare two versions of such Excel reports and display the changes (which can be filtered) that you should focus on.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">The world doesn&#39;t know the extend to which I&#39;ve used and abused openpyxl internally at my workplace. At this point, I should contribute upstream and free myself from the technical karma of silent mercenary consumption.</p>&mdash; aswin c (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1897607562960191848?ref_src=twsrc%5Etfw">March 6, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`

The journey of delivering this tool for this customer was excellent because they knew exactly what they wanted. The customer-facing technical engineer who directed me and led the conversations was also quite talented and helpful that I ended up nominating her for that quarter’s Best Co-worker Award Thingy. We’re now besties.

At the end, the customer tested it in their couple of clusters in a great city near the Taiwan Strait, was happy, and we got the signoff. A ton of money was added to the company's APAC revenue.

Couple of other small tools to assist in testing High Availability cluster failovers, optimizing firewall policies (like, remove zero-hit policies) that stand alone and work with customer’s existing automation pipelines were built and delivered as well. I just don’t want to talk too much here about that.

# Side projects

## tweetlists.app

I wanted to make an app that can let me make a shareable list of tweets. You can see the Lists I've made public at my TweetLists [profile](https://tweetlists.app/chandanaveli)

I built this on Vercel with a Neon database on the backend, and I pretty much made it work by building abstractions on top of each other. It started with a simple Tweet renderer React component – which the initial idea was. Then, I made it to put that list of Tweet IDs into a database, and finally added OAuth. This is my first full-stack app and I’m happy to have a few users (5-7 signups and many anonymous users) for it.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">For a long time, I was thinking &quot;there&#39;s gotta be a better way to share a bunch of tweets together&quot;, so I made <a href="https://t.co/PVkYvEcoe3">https://t.co/PVkYvEcoe3</a>.<br><br>It was kind of fun to hack this together, so check it out: <a href="https://t.co/olkiKTOtkR">pic.twitter.com/olkiKTOtkR</a></p>&mdash; aswin c (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1918259136355287452?ref_src=twsrc%5Etfw">May 2, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 
I got to send this to people and sell this more and I know I haven’t marketed it enough. I know more Twitter “threadbois” would love to use this.

## tiles.run

Watching Claude Artifacts render a React application on the client-side for me was a realization that the idea of instant reusable software could be interfaced in a different way. This was one of the ideas [feynon](http://ankeshbharti.com) had too, but clubbed with many other things. So, we started building.

Currently, [Tiles](https://tiles.run) is a notebook \- an AI-first Notion-like notebook with MCP and agents built-in. For local and client-side use, it can use MCP servers from mcp.run—which are also WebAssembly modules—and runs it locally or on the server-side. Or it can connect to remote MCP servers, such as Asana’s with OAuth and interact with it. Through this came two libraries and a tool:

I learnt a lot about the web, AI, agents, MCP, and what it’s like to be on the frontier of an evolving technology with this.

Tiles is something, but it’s not a product at all right now. But it sure is a signal.

# Future

There is no greater professional joy than putting my own fingerprints in a product, and for that product to find people willing to use and sometimes also trade their hard earned money. The final product is my story in the bigger story, and this is why I think I want to work more on the consumer side – because it’s cool, and also as it involves so much strategy and engineering.

Some closing future-related thoughts:

* Every 8-10 months you learn a bit more about the world, and I understand the world and culture a bit more. In random subtle moments, such as while coming back to the city from parent’s home, on an afternoon walk, I suddenly feel a tiny bit more mature. After all, 2 years is enough time to start seeing things differently.   
  I see a better chance of me making things that are even more useful.  
* Power is an incredible entity and it makes people and systems behave a certain way. A lot of power is invisible and rests in the shadows. I think understanding this helps you recalibrate on what to focus on. I mean this in the realm of the whole world, although flat, is clearly run by a few people and few companies. Disruptions may come from small places, but might get eaten up by the sharks, as a competitor with distribution, data, network/scale effects, or brand could stay more relevant than your product even if your product is 10x better. To rise, one needs to be political as well, and such decisions are made between people who run two different worlds.  
* Generally speaking, in most ways, it's a \_glorious\_ future for generally smart, question-asking, action-oriented people since they'll have all kinds of AI by their side. There is much more room to focus on things that don’t scale.

<div style="display: flex; justify-content: center; width: 100%; margin: 20px 0;">
  <blockquote class="twitter-tweet"><p lang="en" dir="ltr">Generally speaking, in most ways, it&#39;s a _glorious_ future for generally smart, question-asking, action-oriented people since they&#39;ll have all kinds of AI by their side. So much acceleration. Glorious.</p>&mdash; aswin c (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1911639921166884965?ref_src=twsrc%5Etfw">April 14, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>