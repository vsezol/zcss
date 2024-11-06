# ZCSS

A CSS-only framework for rapid web development

## How to Use

Just put it into index.html

```html
<script src="https://cdn.jsdelivr.net/gh/vsezol/zcss/zcss.js" defer></script>

<style zcss>
  for-1-4 {
    article {
      header > h1 {
        font-weight: bold;
        color: green;
        content: "Welcome to zcss $i";
      }

      div > p {
        font-style: italic;
        content: "A CSS-only framework for rapid web development $i";
      }

      footer > onclick {
        content: "console.log('Hello from CSS $i')";

        button {
          content: "Log count!";
        }
      }
    }
  }
</style>
```

## Result will be

![example](example.png)
