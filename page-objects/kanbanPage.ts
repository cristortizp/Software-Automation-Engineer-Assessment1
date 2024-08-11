import { Locator, Page, expect } from "@playwright/test";

export class KanbanPage {

    readonly page: Page;
    readonly darkModeCheckbox: Locator;
    readonly htmlDarkTag: Locator;
    readonly selectionList: Locator;
    readonly firstElement: Locator;
    readonly moreOptionsButton: Locator;
    readonly deleteButton: Locator;
    readonly confirmDelete: Locator;

    constructor(page: Page){
        this.page = page;
        this.darkModeCheckbox = page.locator('label:has(input[type="checkbox"])');
        this.htmlDarkTag = page.locator('html');
        this.selectionList = page.locator('section[data-dragscroll]');
        this.firstElement = page.locator('[data-dragscroll]').first();
        this.moreOptionsButton = page.locator('div.absolute svg g[fill-rule="evenodd"]');
        this.deleteButton = page.getByText('Delete Task');
        this.confirmDelete = page.getByRole('button', { name: 'Delete' });
    }


    async isTheDarkModeActive() {
        await this.darkModeCheckbox.click();
        const htmlDarkTag = this.htmlDarkTag;
        const isTheDarkModeOn = await htmlDarkTag.evaluate(el => el.classList.contains('dark'));
        expect(isTheDarkModeOn).toBe(true); 
    }

    async chooseAnUncompletedTaskCard():Promise<Locator>{
        const sectionList = this.selectionList;
        const elementCount = await sectionList.count();
        if(elementCount > 1){
            const randomIndex = Math.floor(Math.random() * (elementCount - 1)) + 1;
            return sectionList.nth(randomIndex);
        }else {
            throw new Error('There are no elements that matches with the condition');
        }
    }

    async getAllCardsWithUncompletedTasks(section: Locator){
        const allCardList = section.locator('article');
        const firstText = await this.page.locator('h2').first().innerText();
        const firstColumnName = firstText.substring(0,firstText.indexOf('('));
        const cardToBeMovedName = (await this.selectJustUncompletedTaskCards(allCardList)) as string;
        await this.checkAndMoveSubtask();
        await this.moveToFirstColumn(firstColumnName);
        await this.isThisTaskHere(cardToBeMovedName);
    }

    async selectJustUncompletedTaskCards(section: Locator){
        const uncompleteArticles: Locator[] = [];
        const sectionElementCount = await section.count();
        for (let i = 0; i < sectionElementCount; i++) {
            const article = section.nth(i);
            const textContent = await article.locator('p').textContent();
            if (textContent) {
              const match = textContent.match(/(\d+) of (\d+) substasks/);
              if (match) {
                const completed = parseInt(match[1], 10);
                const total = parseInt(match[2], 10);
                if (completed < total) {
                  uncompleteArticles.push(article);
                }
              }
            }
          }

          if (uncompleteArticles.length > 0) {
            const randomArticle = uncompleteArticles[Math.floor(Math.random() * uncompleteArticles.length)];
            const r = await randomArticle.locator('h3').textContent();

            await randomArticle.click({ timeout: 1000 });
            return r;
          } else {
            console.log('There are no cards with uncompleted tasks');
          }
    }

    async checkAndMoveSubtask(){
        const spanTagList = this.page.locator('label span');
        const count = await spanTagList.count();
        for (let i = 0; i < count; i++) {
        const span = spanTagList.nth(i);
        const isTheTaskCompleted = await span.evaluate((element) => element.classList.contains('line-through'));
            if (!isTheTaskCompleted) {
                await span.click();
                return; 
            }
        }
        console.log('All the tasks are completed.');
    }

    async moveToFirstColumn(columnName: string){
        const element = this.page.locator('.group-focus\\:hidden');
        await element.click({ timeout: 1000});
        const div = this.page.locator(`div.hover\\:text-black.dark\\:hover\\:text-white:has-text("${columnName}")`);
        await div.click();
        await this.page.mouse.click(0, 0);
    }

    async isThisTaskHere(taskName: string){
        const firstElement = this.page.locator('[data-dragscroll]').first();
        await expect(firstElement).toContainText(taskName);
    }

    async selectAndDeleteACard(cardTextToBeDeleted: string){
        await this.moreOptionsButton.first().click();
        await this.deleteButton.click();
        await this.confirmDelete.click();
        await expect(this.page.locator('body')).not.toContainText(cardTextToBeDeleted);
    }   

    async selectRandomCard(){
        const TaskListElements = this.page.locator('section[data-dragscroll]');
        const TaskListElementsCount = await TaskListElements.count();
        const randomIndex = Math.floor(Math.random() * TaskListElementsCount);
        const randomElement = TaskListElements.nth(randomIndex);
        const selectedColumnText = (await randomElement.locator('h2').textContent()) as string;
        const cardArticleElements = randomElement.locator('article');
        const taskCountInSelectedColumn = await cardArticleElements.count();
        const randomH3Index = Math.floor(Math.random() * taskCountInSelectedColumn);
        const randomH3 = cardArticleElements.nth(randomH3Index);
        await randomH3.click();
        await this.selectAndDeleteACard(selectedColumnText)
        const articlesAfterDeleting = randomElement.locator('article');
        const taskCountInSelectedColumnAfterDeleting = await articlesAfterDeleting.count();
        expect(taskCountInSelectedColumn).not.toEqual(taskCountInSelectedColumnAfterDeleting);
    }
}