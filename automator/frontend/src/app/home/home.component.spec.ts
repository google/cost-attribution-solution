import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HomeComponent } from "./home.component"; // Correct import path

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    // Since HomeComponent is standalone, we just import it directly
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display the welcome heading", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headingElement = compiled.querySelector("h1");
    expect(headingElement).toBeTruthy(); // Check if the h1 element exists
  });

  it("should display the logo image", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const imgElement = compiled.querySelector("img");
    expect(imgElement).toBeTruthy(); // Check if the img element exists
    // Check if the src attribute ends with the expected path
    // The full URL might vary depending on the test environment base URL
    expect(imgElement?.src).toContain("assets/logo.png");
  });
});
