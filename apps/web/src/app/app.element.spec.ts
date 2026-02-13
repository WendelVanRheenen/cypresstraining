import { AppElement } from './app.element';

describe('AppElement', () => {
  it('should render the title', () => {
    customElements.define('test-root', AppElement);
    const element = document.createElement('test-root');
    document.body.appendChild(element);
    expect(element.textContent).toContain('Spicy Pepper Shop');
  });
});
