const axios = require("axios");

class LinkValidator {
  constructor() {
    this.trustedDomains = new Set([
      // Learning Platforms
      "freecodecamp.org",
      "codecademy.com",
      "pluralsight.com",
      "udemy.com",
      "coursera.org",
      "edx.org",
      "khanacademy.org",
      "sololearn.com",
      "code.org",
      "scrimba.com",
      "codeschool.com",
      "treehouse.com",
      "lynda.com",
      "skillshare.com",
      "udacity.com",
      "educative.io",
      
      // Documentation & Tutorials
      "geeksforgeeks.org",
      "tutorialspoint.com",
      "w3schools.com",
      "javascript.info",
      "realpython.com",
      "pythontutorial.net",
      "javatpoint.com",
      "programiz.com",
      "tutorialkart.com",
      "baeldung.com",
      "tutorialrepublic.com",
      "studytonight.com",
      "techonthenet.com",
      
      // Community & Blogs
      "dev.to",
      "stackoverflow.com",
      "hashnode.com",
      "medium.com",
      "css-tricks.com",
      "smashingmagazine.com",
      "sitepoint.com",
      "digitalocean.com",
      "scotch.io",
      "auth0.com",
      "blog.logrocket.com",
      
      // Practice Platforms
      "leetcode.com",
      "hackerrank.com",
      "codewars.com",
      "codechef.com",
      "codeforces.com",
      "topcoder.com",
      "codesignal.com",
      "exercism.org",
      "projecteuler.net",
      "coderbyte.com",
      "edabit.com",
      "codingame.com",
      "atcoder.jp",
      "spoj.com",
      "interviewbit.com",
      "pramp.com",
      "algoexpert.io",
      "hackerearth.com",
      
      // Video Platforms
      "youtube.com",
      "youtu.be",
      "vimeo.com",
      "twitch.tv",
      "egghead.io",
      "laracasts.com",
      "wes.bos",
      "leveluptuts.com",
      
      // Official Documentation
      "react.dev",
      "vuejs.org",
      "angular.io",
      "nodejs.org",
      "expressjs.com",
      "python.org",
      "docs.djangoproject.com",
      "flask.palletsprojects.com",
      "laravel.com",
      "spring.io",
      "dotnet.microsoft.com",
      "go.dev",
      "rust-lang.org",
      "php.net",
      "ruby-lang.org",
      "scala-lang.org",
      "kotlinlang.org",
      "swift.org",
      "developer.mozilla.org",
      
      // Database Documentation
      "postgresql.org",
      "mongodb.com",
      "mysql.com",
      "redis.io",
      "neo4j.com",
      "cassandra.apache.org",
      
      // Cloud & DevOps
      "kubernetes.io",
      "docker.com",
      "aws.amazon.com",
      "cloud.google.com",
      "azure.microsoft.com",
      "digitalocean.com",
      "heroku.com",
      "netlify.com",
      "vercel.com",
      
      // Code Editors & Tools
      "codepen.io",
      "replit.com",
      "codesandbox.io",
      "stackblitz.com",
      "glitch.com",
      "jsfiddle.net",
      "jsbin.com",
      
      // Testing & Tools
      "cypress.io",
      "selenium.dev",
      "jestjs.io",
      "mochajs.org",
      "postman.com",
      "insomnia.rest",
      
      // Design & UI
      "figma.com",
      "sketch.com",
      "adobe.com",
      "canva.com",
      "dribbble.com",
      "behance.net",
      
      // Version Control
      "github.com",
      "gitlab.com",
      "bitbucket.org",
      "git-scm.com"
    ]);
  }

  getDomain(url) {
    try {
      return new URL(url).hostname.replace("www.", "").toLowerCase();
    } catch {
      return null;
    }
  }

  isTrustedDomain(url) {
    const domain = this.getDomain(url);
    return domain ? this.trustedDomains.has(domain) : false;
  }

  async isLinkAlive(url) {
    try {
      let res = await axios.head(url, { timeout: 8000 });
      return res.status >= 200 && res.status < 400;
    } catch {
      try {
        let res = await axios.get(url, { timeout: 8000 });
        return res.status >= 200 && res.status < 400;
      } catch {
        return false;
      }
    }
  }

  async validateResources(resources) {
    return Promise.all(
      resources.map(async (res) => {
        const domain = this.getDomain(res.link);
        if (!domain) return { ...res, isValidated: false, validationStatus: "invalid" };
        const alive = await this.isLinkAlive(res.link);
        if (!alive) return { ...res, isValidated: false, validationStatus: "invalid" };
        return this.trustedDomains.has(domain)
          ? { ...res, isValidated: true, validationStatus: "valid" }
          : { ...res, isValidated: true, validationStatus: "unverified" };
      })
    );
  }

  async validateLink(url) {
    const domain = this.getDomain(url);
    if (!domain) return { isValid: false, status: "invalid", error: "Invalid URL" };

    const alive = await this.isLinkAlive(url);
    if (!alive) return { isValid: false, status: "invalid", error: "Link not reachable" };

    // ✅ Fixed: Return proper status values that match enum
    return this.trustedDomains.has(domain)
      ? { isValid: true, status: "verified" } // Will be mapped to "valid" in controller
      : { isValid: true, status: "unverified" };
  }

  async validateLinks(urls, timeout = 5) {
    return Promise.all(
      urls.map(async (url) => {
        try {
          return await this.validateLink(url);
        } catch (error) {
          return { isValid: false, status: "invalid", error: error.message };
        }
      })
    );
  }

  getFallbackResources(topic, category) {
    const fallbacks = {
      Theory: [
        { title: "freeCodeCamp", link: "https://freecodecamp.org", summary: "Comprehensive free coding bootcamp with interactive lessons and projects", difficulty: "Beginner" },
        { title: "JavaScript.info", link: "https://javascript.info", summary: "Modern JavaScript tutorial with detailed explanations and examples", difficulty: "Intermediate" },
        { title: "Dev.to Community", link: "https://dev.to", summary: "Developer community with in-depth articles and technical discussions", difficulty: "Advanced" }
      ],
      Videos: [
        { title: "freeCodeCamp YouTube", link: "https://youtube.com/c/freecodecamp", summary: "Free comprehensive programming courses and tutorials", difficulty: "Beginner" },
        { title: "Traversy Media", link: "https://youtube.com/c/TraversyMedia", summary: "Web development tutorials and crash courses by Brad Traversy", difficulty: "Intermediate" },
        { title: "Fireship", link: "https://youtube.com/c/Fireship", summary: "Quick programming concepts, latest tech trends, and code tutorials", difficulty: "Advanced" }
      ],
      Docs: [
        { title: "W3Schools", link: "https://w3schools.com", summary: "Web development tutorials and references with interactive examples", difficulty: "Beginner" },
        { title: "React Documentation", link: "https://react.dev", summary: "Official React documentation with guides and API reference", difficulty: "Intermediate" },
        { title: "Python Official Docs", link: "https://python.org", summary: "Comprehensive Python language documentation and tutorials", difficulty: "Advanced" }
      ],
      Practice: [
        { title: "Codewars", link: "https://codewars.com", summary: "Coding challenges (kata) with community solutions and discussions", difficulty: "Beginner" },
        { title: "HackerRank", link: "https://hackerrank.com", summary: "Programming challenges for interview preparation and skill development", difficulty: "Intermediate" },
        { title: "LeetCode", link: "https://leetcode.com", summary: "Algorithm and data structure problems for technical interviews", difficulty: "Advanced" }
      ]
    };
    return fallbacks[category] || [];
  }
}

module.exports = LinkValidator;
