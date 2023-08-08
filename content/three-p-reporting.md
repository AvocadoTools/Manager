What did you do last week? Not down to the minute, but what were the high-level themes of the work you did last week? This is not a trick question, and should be relatively easy to answer. Got it? Cool! Now, what did you do 24 weeks ago (six months)? Is that a little harder to answer? A lot harder? Okay, well, here comes the annual review; are you ready? Or are you going to spend countless hours digging through material to try and justify your existence to the business? 

> Ug! This is all such a drag. All I really want to do is code/write/anything else!

One of the many techniques I use to solve this problem is what I call the "Three P" weekly status report. Why "Three P"? Because there are three parts to it: progress, priorities, and problems. 

* **Progress:** Details about the work you completed over the last week
* **Priorities:** Work you intend to accomplish in the week ahead
* **Problems:** Issues that are slowing you down or preventing progress

## The First Report

Once a week, generally on Monday or Friday, create a new markdown document. Save the file using a name consisting of the current ISO 8601 formatted date, followed by a dash, followed by the word "status" and then the `md` markdown extension. This results in a file name along the lines of `2022-06-06-status.md` for `June 6, 2022`. It does not matter that you use this suggested formatting approach. Whatever you choose - you must be consistent. I use the ISO 8601 approach because it makes the status report files easily sortable whether you are using a command line or GUI finder.

With our report file created, break out the three sections of progress, priorities, and problems. I generally use an `H2` heading for the sections. Using an `H2` provides the flexibility of using an `H1` for the title should the report need one. An example of where a title might be included is when you spend all week dedicated to a significant event for the company (e.g. AWS re:Invent).

``` md
## Progress

- Finished meetup presentation 🙌
- Drove social media attention for my session
  - Twitter
  - YouTube preview
  - Blog post

## Priorities

- Deliver meetup presentation
- Draft API for v2 architecture meeting
- Fix bug KH-123 once and for all

## Problems

- Access to production database
- Plane was delayed - avoid ORD ✈️
- Did not get adequate sleep
```

### Progress

Next up, review the work you did over the last week and try to summarize it into three-to-five items. Sometimes there are more items that you may want to call out - sometimes many more - and that is fine. Add what you need. Want to embellish? Add a link to a bug you fixed? Great! Markdown is there for you. Have fun. This is *your* status report after all. The point here is not to detail every waking minute, the point is to record a general sense of how you spent the time. 

If you stop for a moment, take a breath, and think about what you accomplished this past week, certain items will likely surface in your mind. These items, and potentially the items related to those items, are what you are trying to capture.

> Be natural. You have nobody to impress here but yourself. This is not the place for self-aggrandizing.

### Priorities

With last week in the mirror, take another breath. What are you looking to accomplish in the week ahead? Again, this is relatively high-level with three-to-five bullets (more if you need it). While you should never retroactively go back and change these items once you have finished the report and started the week, these items do not necessarily need to reflect the actual outcome of the week. It is totally acceptable to not complete your priority items - or to end up doing more than you anticipated. 

At this time, in this space, you are trying to capture your intentions. Nobody is going to harass you about what you did not do except for yourself - which is kind of the point, and one of the interesting side-effects of this approach to capturing your work. You may start out the week with one set of intentions, only to find that events took an unexpected twist along the way. Looking back on your reports will show that course clearly, which is exactly the type of detail we want to capture.

### Problems

And finally there are the problems you are currently experiencing that are preventing you from doing something you want. You may not have problems every week, and that is fine. Over the years of using this technique, I will frequently list the problems that are going on outside of work, that impact my productivity while at work. Perhaps the "check engine" light came on in my car, and trying to schedule everything to get it fixed is decreasing my productivity.

> It is okay to have fun. Use emojis where they fit the context to capture that extra little bit of emotion around the situation.

## The Second Report

As the second week rolls around, and you set aside time to write your second weekly report, the process starts pretty much the same as before. New file, new date, the three parts. Now open the report from the previous week. See those "priorities" you listed? At least some of those are likely "progress" items now, so move them on over to the new report. Congratulations! You are on your way to status report legend.

## The Magic

Now you are taking fifteen minutes, once per week, to put together a weekly status report. A few weeks go by, and you look back at some of the reports. You will start to see the the evolution from problem, to priority, to progress. This becomes even more pronounced with time. It feels very rewarding to see the progress.

> I like to schedule time on my calendar to do my weekly status report.

Beyond that, when annual review time comes around, you will have a months (year) long trail of all the work you have done. Reviewing your weekly status reports, you extract the more important points that map to your goals. A little polishing to form a cohesive narrative, and you are done. This time the annual review was not a pain, but actually a kind of enjoyable trip down memory lane.

## The Scale

This useful technique may seem like a nice-to-have at the individual level, but it *really* starts to shine when it involves a whole team!

For a manager, your first task is to be able to gather all the weekly status reports. You need to make that process as painless as possible otherwise they will not get written (or at least not submitted). Having managed mostly developers, I want the status reports to work they way that my team works, so I set up a private source control repository to collect the reports. Inside the repository is a folder named after the email alias of each person on the team. 

Everybody on the team has full access to the entire repository - and only those on the team. This means complete transparency between team members. Everybody knows what the others are doing, and how they compare. In many cases, team members will find common threads and proactively reach out to one another. This could be some significant business problem that needs solving, or as small as some helpful travel advice. Whatever it is - it is collaboration which yields dramatic team cohesion and efficiency. All for the low price of fifteen minutes, once per week.

That last minute one-on-one where your boss interrogates you about that status of your team is now instantly painless. A quick `grep` of the repository can give you pretty much everything you need to know. The pain of annual reviews becomes a thing of the past as individuals have more direct insight into the work they completed.

> I sometimes call this increased agency "write your own annual review" or "write your own promotion". I encourage individuals to take ownership of their career.

As a manager, you might be inclined to think that the status report does not contain near enough information. This reporting process is not designed to replace other mechanisms that you have in place (or should have in place). If you need a more detailed view into a specific project, then that should be an additional report or meeting.


## The Markdown?

For me, markdown is the magic behind the magic. You might say that markdown is just a file format. These could be Word documents. On a technical level, you are absolutely right. On a practical level, markdown makes the difference... At least for developer-oriented roles.

When a developer wants to start putting together their weekly status report it is just a `Ctrl+C Ctrl+V` away. No new process. No new tooling. Not another SaaS login. Works online and offline. Requires no more computing power.

When it comes to a private source control repository, the effort of writing the weekly status report is again, the same workflow already being used. All done for the week? Toggle to your terminal and use the source control CLI, or whatever you may already have in your IDE/tooling. The "Three P" does not dictate individual workflow - work how you work, use what you use. 

> The goal is to keep the barrier to entry as low as possible.

Further, markdown, as a text-baed format, makes for easy search. As a manager you often have to locate certain details very quickly, and with markdown, your answers are just a `grep` away. Markdown is also easy to parse. A splash of your language of choice, and you can post-process weekly reports into a single unified report of everything your team has done for the last week, the last quarter, or even the last year.


## The Conclusion

This concept is not new. The [Franklin Covey](https://en.wikipedia.org/wiki/The_7_Habits_of_Highly_Effective_People) system is very similar in nature. Carry forward the things you need to do that you did not do today. Agile has the Scrum methodology of accomplishments, goals, and blockers - but that is not a fun acronym. This specific variation is rewarding for both the individual, and the manger, and supports a modern developer workflow. Paired with other strategies, which I will cover in future posts, it is a recipe for effortless time management and reporting.

Have criticisms? Additions? Are there specifics I left out that you need to understand? Post a comment, and let me know!

## The Addendum

Historically, as a manager, I have had pretty solid insight into the work the team is doing - if not outright influence and control. This comment should not surprise anybody. However, I have recently encountered a management scenario where that insight and influence is very low. At the very least, insight matters for annual reviews, promotions, etc. Influence matters for reasons of coaching, mentoring, and "firewall" activities.

To address this, I have recently started requesting a fourth "P" for "Plan". I ask for a rolling four-week high-level plan painted with broad brushes. I do not need to know how the team spends every hour of their week. I do need to know what feature(s) or issues they intend to tackle. This is the kind of data that one might use in a rollup report for senior management and/or other stakeholders. 

In keeping with the Markdown approach, I have encouraged the use of the [Markwhen](https://markwhen.com/) syntax. Since Markwhen has a parser, I can easily extract the parts of the individual reports that I need for the rollup reports. 

``` md
## Plan

group Important Project
2022-07-18/2022-07-22: Start Feature ABC-123
2022-07-25/2022-07-29: Issued filed by customer  
[Ticket](link-to-ticket)
2022-08-08/2022-08-10: Finish feature ABC-123
2022-08-11/2022-08-12: Transition to Feature 123-ABC

group Vacation/PTO
2022-08-15/2022-08-19: Kevin on vacation (Oregon Coast)

group Professional Development
2022-08-01/2022-08-05: Certification training
```

Every week, each individual on the team (myself included), add the work for the next week to the "Plan" section, and remove the week that just was just completed (past). I cannot be sure yet just how the team will respond to this work long term, but wanted to document the addition and its motivations.
