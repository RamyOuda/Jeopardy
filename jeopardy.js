// categories is the main data structure for the app; it looks like this:

//  [
//    { title: `Math`,h
//      clues: [
//        {question: `2+2`, answer: 4, showing: null},
//        {question: `1+1`, answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: `Literature`,
//      clues: [
//        {question: `Hamlet Author`, answer: `Shakespeare`, showing: null},
//        {question: `Bell Jar Author`, answer: `Plath`, showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

async function getCategoryIds() {
  const categoryData = await axios.get(
    `https://jservice.io/api/categories?count=6&offset=${Math.floor(
      Math.random() * 100
    )}`
  );

  // For some reason, any category that is just a single letter seems to be bugged (I think from the API's side, they do not have questions/answers associated with them so they return null/errors when trying to access them).

  // This loop checks to make sure that none of the categories are a single letter. If there is, it re-runs the function and checks again. There should never be a bugged/single-letter category returned to the table.

  for (let i = 0; i < 6; i++) {
    if (categoryData.data[i].title.length === 1) return getCategoryIds();
  }

  const categoryIDs = [];

  for (each of categoryData.data) {
    categoryIDs.push(each.id);
  }

  return categoryIDs;
}

/** Return object with data about a category:
 *
 *  Returns { title: `Math`, clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: `Hamlet Author`, answer: `Shakespeare`, showing: null},
 *      {question: `Bell Jar Author`, answer: `Plath`, showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const response = await axios.get(
    `https://jservice.io/api/category?id=${catId}&offset=${Math.floor(
      Math.random() * 100
    )}`
  );

  const clues = response.data.clues.map((val) => ({
    question: val.question,
    answer: val.answer,
    showing: null,
  }));

  return { title: response.data.title, clues };
}

/** Fill the HTML table with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a `?` where the question/answer would go.)
 */

async function fillTable() {
  $(`thead`).empty();
  $(`tbody`).empty();

  const $tr = $(`<tr>`);

  for (let i = 0; i < 6; i++) {
    $tr.append($(`<th>`).text(categories[i].title));
  }

  $(`thead`).append($tr);

  for (let i = 0; i < 5; i++) {
    const $tr = $(`<tr>`);

    for (let j = 0; j < 6; j++) {
      $tr.append($(`<td>`).attr(`id`, `${j}-${i}`).text(`?`));
    }

    $(`tbody`).append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to `question`
 * - if currently `question`, show answer & set .showing to `answer`
 * - if currently `answer`, ignore click
 * */

function handleClick(evt) {
  const id = evt.target.id;
  const [y, x] = id.split(`-`);
  const clue = categories[y].clues[x];

  let text;

  if (!clue.showing) {
    $(this).addClass(`question`);
    text = clue.question;
    clue.showing = `question`;
  } else if (clue.showing === `question`) {
    $(this).removeClass(`question`).addClass(`answer`);
    text = clue.answer;
    clue.showing = `answer`;
  }

  $(`#${y}-${x}`).html(text);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $(`thead`).empty();
  $(`tbody`).empty();
  $(`button`).addClass(`hidden`);

  $(`.spinner`).html(`<div class="spinner-border" role="status">
  <span class="sr-only">Loading...</span>
</div>`);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $(`.spinner`).html(``);
  $(`button`).removeClass(`hidden`);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();

  const categoryIDs = await getCategoryIds();

  categories = [];

  for (let each of categoryIDs) {
    categories.push(await getCategory(each));
  }

  fillTable();

  hideLoadingView();
}

/** On click of restart button, restart game. */

$(`button`).on(`click`, setupAndStart);

/** On page load, setup and start & add event handler for clicking clues */

$(async function () {
  setupAndStart();
  $(`table`).on(`click`, `td`, handleClick);
});
