import { test, expect } from '@playwright/test'
import { KanbanPage } from '../page-objects/KanbanPage';


test.beforeEach(async({page})=> {
    await page.goto('https://kanban-566d8.firebaseapp.com/');
});

test('Test 1: Edit a Kanban Card', async({page})=> {
    const navigateTo = new KanbanPage(page);
    const sectionSelector = await navigateTo.chooseAnUncompletedTaskCard();
    await navigateTo.getAllCardsWithUncompletedTasks(sectionSelector);
});


test('Test 2: Delete a Kanban card', async({ page}) => {
    const navigateTo = new KanbanPage(page);
    const randomCard = await navigateTo.selectRandomCard();
});


test('Test 3: Toggle dark mode', async ({ page })=> {
    const navigateTo = new KanbanPage(page);
    await navigateTo.isTheDarkModeActive();
});