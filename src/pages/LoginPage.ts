import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import strings from '../utils/strings.json';

export class LoginPage extends BasePage {
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  public constructor(page: Page) {
    super(page, 'LoginPage');

    this.usernameField = this.page
      .getByLabel(strings.pages.login.usernameFieldLabel)
      .describe('Username input field');
    this.passwordField = this.page
      .getByLabel(strings.pages.login.passwordFieldLabel)
      .describe('Password input field');
    this.loginButton = this.page
      .getByRole('button', { name: strings.pages.login.loginButtonAccessibleName })
      .describe('Login button');
  }

  public async navigateToLoginPage(): Promise<void> {
    await this.navigateToUrlPath(strings.pages.login.urlPath);
  }

  public async fillUsernameField(username: string): Promise<void> {
    await this.fillElementWithText(this.usernameField, username, 'Username input field');
  }

  public async fillPasswordField(password: string): Promise<void> {
    await this.fillElementWithText(this.passwordField, password, 'Password input field');
  }

  public async clickLoginButton(): Promise<void> {
    await this.clickOnElement(this.loginButton, 'Login button');
  }

  public async submitLoginFormWithCredentials(username: string, password: string): Promise<void> {
    await this.fillUsernameField(username);
    await this.fillPasswordField(password);
    await this.clickLoginButton();
  }

  public async assertUsernameFieldIsVisible(): Promise<void> {
    await this.assertElementIsVisible(this.usernameField, 'Username input field');
  }

  public async assertPasswordFieldIsVisible(): Promise<void> {
    await this.assertElementIsVisible(this.passwordField, 'Password input field');
  }

  public async assertLoginButtonIsEnabled(): Promise<void> {
    await this.assertElementIsEnabled(this.loginButton, 'Login button');
  }

  public async validateLoginPageDisplay(): Promise<void> {
    await this.assertUsernameFieldIsVisible();
    await this.assertPasswordFieldIsVisible();
    await this.assertLoginButtonIsEnabled();
  }
}
