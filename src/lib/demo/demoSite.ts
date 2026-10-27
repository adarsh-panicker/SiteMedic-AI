export interface DemoFile {
  path: string;
  content: string;
  type: "html" | "css" | "js";
  description: string;
}

export const DEMO_FILES: DemoFile[] = [
  {
    path: "index.html",
    type: "html",
    description: "Main page — missing meta description, H1, viewport; has missing alt text",
    content: `<!DOCTYPE html>
<html>
<head>
  <title>Acme Corp</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="products.html">Products</a>
      <a href="contact.html">Contact Us</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <img src="/images/hero.jpg">
      <img src="/images/team.jpg">
      <h2>Welcome to Acme Corp</h2>
      <p>We make the world's finest widgets and gadgets.</p>
      <a href="#"><button>Get Started</button></a>
    </section>

    <section class="features">
      <div class="feature">
        <img src="/images/icon-quality.png" alt="image">
        <h3>Quality Products</h3>
        <p>Our products are built to last.</p>
      </div>
      <div class="feature">
        <img src="/images/icon-support.png">
        <h3>24/7 Support</h3>
        <p>We are always here to help.</p>
      </div>
      <div class="feature">
        <img src="/images/icon-shipping.png" alt="photo">
        <h3>Fast Shipping</h3>
        <p>Get your order in 2-3 days.</p>
      </div>
    </section>

    <section class="newsletter">
      <h3>Subscribe to our newsletter</h3>
      <form>
        <input type="email" placeholder="Enter your email">
        <input type="submit" value="Subscribe">
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2024 Acme Corp. <a href="privacy.html">Privacy Policy</a></p>
  </footer>
</body>
</html>`,
  },
  {
    path: "about.html",
    type: "html",
    description: "About page — missing lang attribute, broken internal link, no canonical",
    content: `<!DOCTYPE html>
<html>
<head>
  <title>About Us | Acme Corp</title>
  <meta name="description" content="Learn about Acme Corp, our mission, and our team.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="products.html">Products</a>
      <a href="careers.html">Careers</a>
    </nav>
  </header>

  <main>
    <h1>About Acme Corp</h1>
    <p>We have been making widgets since 1985.</p>

    <h2>Our Team</h2>
    <div class="team">
      <div class="member">
        <img src="/images/alice.jpg" alt="Alice Johnson, CEO">
        <h3>Alice Johnson</h3>
        <p>Chief Executive Officer</p>
      </div>
      <div class="member">
        <img src="/images/bob.jpg" alt="Bob Smith, CTO">
        <h3>Bob Smith</h3>
        <p>Chief Technology Officer</p>
      </div>
    </div>

    <p>Read our <a href="mission-statement.html">Mission Statement</a> to learn more.</p>
    <p>View our <a href="old-blog/post1.html">Blog</a>.</p>
  </main>

  <footer>
    <p>&copy; 2024 Acme Corp</p>
  </footer>
</body>
</html>`,
  },
  {
    path: "contact.html",
    type: "html",
    description: "Contact page — form inputs without labels, multiple H1s",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Contact Us | Acme Corp</title>
  <meta name="description" content="Get in touch with Acme Corp.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <main>
    <h1>Contact Us</h1>
    <h1>Get In Touch</h1>

    <form action="/submit" method="post">
      <div>
        <input type="text" placeholder="Your name" name="name">
      </div>
      <div>
        <input type="email" placeholder="Your email" name="email">
      </div>
      <div>
        <input type="tel" placeholder="Phone number" name="phone">
      </div>
      <div>
        <textarea name="message" placeholder="Your message"></textarea>
      </div>
      <button type="submit">Send Message</button>
    </form>

    <h2>Office Location</h2>
    <p>123 Widget Street, Innovation City, CA 94000</p>
  </main>

  <footer>
    <p>&copy; 2024 Acme Corp</p>
  </footer>
</body>
</html>`,
  },
  {
    path: "styles.css",
    type: "css",
    description: "Main stylesheet — no media queries, potential contrast issue",
    content: `/* Acme Corp Stylesheet */
body {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #fff;
  margin: 0;
  padding: 0;
}

header {
  background-color: #1a1a2e;
  padding: 20px;
}

nav a {
  color: #fff;
  text-decoration: none;
  margin-right: 20px;
}

.hero {
  background-color: #fff;
  color: #fff;
  padding: 60px 20px;
  text-align: center;
}

.hero h2 {
  font-size: 2em;
}

.features {
  display: flex;
  padding: 40px 20px;
}

.feature {
  flex: 1;
  padding: 20px;
  text-align: center;
}

.newsletter {
  background: #f5f5f5;
  padding: 40px;
  text-align: center;
}

.newsletter input[type="email"] {
  padding: 10px;
  width: 300px;
}

footer {
  background: #1a1a2e;
  color: #999;
  padding: 20px;
  text-align: center;
}

footer a {
  color: #999;
}

.team {
  display: flex;
  gap: 20px;
}

.member {
  text-align: center;
}

.member img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}`,
  },
];

export const DEMO_FIXED_FILES: Partial<Record<string, string>> = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Acme Corp — Quality Widgets & Gadgets</title>
  <meta name="description" content="Acme Corp makes the world's finest widgets and gadgets. Shop our products and experience unmatched quality and support.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:title" content="Acme Corp — Quality Widgets & Gadgets">
  <meta property="og:description" content="Acme Corp makes the world's finest widgets and gadgets.">
  <link rel="canonical" href="https://acmecorp.example.com/">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav aria-label="Main navigation">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="products.html">Products</a>
      <a href="contact.html">Contact Us</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Quality Widgets & Gadgets by Acme Corp</h1>
      <img src="/images/hero.jpg" alt="Acme Corp product lineup — widgets and gadgets">
      <img src="/images/team.jpg" alt="The Acme Corp team">
      <p>We make the world's finest widgets and gadgets.</p>
      <a href="products.html"><button>Get Started</button></a>
    </section>

    <section class="features">
      <div class="feature">
        <img src="/images/icon-quality.png" alt="Quality assurance icon">
        <h2>Quality Products</h2>
        <p>Our products are built to last.</p>
      </div>
      <div class="feature">
        <img src="/images/icon-support.png" alt="24/7 customer support icon">
        <h2>24/7 Support</h2>
        <p>We are always here to help.</p>
      </div>
      <div class="feature">
        <img src="/images/icon-shipping.png" alt="Fast shipping delivery truck icon">
        <h2>Fast Shipping</h2>
        <p>Get your order in 2-3 days.</p>
      </div>
    </section>

    <section class="newsletter">
      <h2>Subscribe to our newsletter</h2>
      <form>
        <label for="newsletter-email">Email address</label>
        <input type="email" id="newsletter-email" name="email" placeholder="Enter your email">
        <input type="submit" value="Subscribe">
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2024 Acme Corp. <a href="privacy.html">Privacy Policy</a></p>
  </footer>
</body>
</html>`,
};

export const DEMO_ISSUES_DESCRIPTION = [
  {
    file: "index.html",
    issues: [
      "Missing <html lang> attribute",
      "Missing meta description",
      "Missing viewport meta tag",
      "No H1 element (hero section uses H2)",
      "3 images missing alt attributes",
      "2 images with non-descriptive alt text ('image', 'photo')",
      "Empty anchor link (<a href=\"#\">)",
      "Newsletter input missing label",
    ],
  },
  {
    file: "about.html",
    issues: [
      "Missing <html lang> attribute",
      "Broken link: mission-statement.html (file not in archive)",
      "Broken link: old-blog/post1.html (file not in archive)",
    ],
  },
  {
    file: "contact.html",
    issues: [
      "Multiple H1 elements (2 found)",
      "3 form inputs missing associated labels (name, email, phone)",
    ],
  },
  {
    file: "styles.css",
    issues: [
      "No responsive @media queries",
      "Potential contrast issue: white text on white background (.hero)",
    ],
  },
];
