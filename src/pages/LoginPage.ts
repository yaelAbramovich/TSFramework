import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import strings from '../utils/strings.json';

export class LoginPage extends BasePage {
  // Route path is automation-internal (used only for navigation, never
  // rendered to the user) - not strings.json material. Same treatment as
  // an API client's endpoint path constants.
  private static readonly LOGIN_URL_PATH = '/login';

  private readonly emailInput = this.page
    .getByLabel(strings.pages.login.emailLabel)
    .describe('Login page - email input');

  private readonly passwordInput = this.page
    .getByLabel(strings.pages.login.passwordLabel)
    .describe('Login page - password input');

  private readonly signInButton = this.page
    .getByRole('button', { name: strings.pages.login.signInButtonName })
    .describe('Login page - sign in button');

  public constructor(page: Page) {
    super(page, 'LoginPage');
  }

  public async navigateToLoginPage(): Promise<void> {
    await this.navigateToUrlPath(LoginPage.LOGIN_URL_PATH);
  }

  public async fillEmailField(email: string): Promise<void> {
    await this.fillElementWithText(this.emailInput, email, 'Login page - email input');
  }

  public async fillPasswordField(password: string): Promise<void> {
    await this.fillElementWithText(this.passwordInput, password, 'Login page - password input');
  }

  public async clickSignInButton(): Promise<void> {
    await this.clickOnElement(this.signInButton, 'Login page - sign in button');
  }

  public async submitLoginFormWithCredentials(email: string, password: string): Promise<void> {
    await this.fillEmailField(email);
    await this.fillPasswordField(password);
    await this.clickSignInButton();
  }
}
