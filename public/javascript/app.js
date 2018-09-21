const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
const body = document.body;
const html = document.documentElement;
console.log('boom');
const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const slugify = text => text.toLowerCase().replace(/[\W_]+/g, '-');
const post = document.querySelector('.post_container article .post');
if (post) {
  const aside = document.querySelector('.post_container aside .inner');
  const postHeadingsContainer = document.createElement('div');
  const headings = [].slice.call(post.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  headings.reverse();
  console.log(headings);
  aside.insertAdjacentElement('beforeend', postHeadingsContainer);
  headings.forEach((heading, index) => {
    const type = heading.tagName.toLowerCase();
    const copy = toTitleCase(heading.innerText);
    const anchorName = slugify(copy);
    const anchor = document.createElement('a');
    const link = document.createElement('a');
    link.setAttribute('href', `#${anchorName}`);
    link.classList.add(slugify(type));
    link.innerText = copy;
    anchor.setAttribute('id', anchorName);
    heading.insertAdjacentElement('beforebegin', anchor);
    postHeadingsContainer.insertAdjacentElement('afterbegin', link);
    console.log(index, anchorName);
  });

  let CurrentScroll = 0;
  window.onscroll = function windowScroll() {
    const scroll = window.pageYOffset;

    // log for debug
    // console.log(scroll);
    headings.forEach(heading => {
      const position = heading.offsetTop - scroll;
      if (position <= screenHeight * 0.66) {
        const currentHeading = document.querySelector(`aside a[href="#${slugify(heading.innerText)}"]`);
        currentHeading.setAttribute('data-state', 'is-active');
      } else {
        const currentHeading = document.querySelector(`aside a[href="#${slugify(heading.innerText)}"]`);
        currentHeading.setAttribute('data-state', 'not-active');
      }
    });

    CurrentScroll = scroll; // Updates current scroll position
  };
}
//# sourceMappingURL=app.js.map
