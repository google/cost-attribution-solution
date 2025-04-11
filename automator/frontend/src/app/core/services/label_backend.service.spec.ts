import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { LabelBackendService } from "./label_backend.service";
import { SERVICE_CONFIG } from "../model/values";
import {
  Response,
  BulkResponse,
  ResourceLabels,
  Binding,
  UploadResponse,
} from "../model/models";

describe("LabelBackendService", () => {
  let service: LabelBackendService;
  let httpMock: HttpTestingController;
  const mockApiUrl = "http://mock-api.com";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LabelBackendService,
        { provide: SERVICE_CONFIG, useValue: { apiUrl: mockApiUrl } },
      ],
    });
    service = TestBed.inject(LabelBackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fetch resources for labels", () => {
    const dummyResources: ResourceLabels[] = [
      {
        id: "res1",
        name: "Resource1",
        type: "type1",
        location: "loc1",
        labels: [{ id: "l1", value: "v1" }],
      },
    ];

    service.fetchResources().subscribe((resources) => {
      expect(resources.length).toBe(1);
      expect(resources).toEqual(dummyResources);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/resources?type=labels`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyResources);
  });

  it("should update resource labels", () => {
    const resourceId = "res1";
    const location = "loc1";
    const labels: Binding[] = [{ id: "labelKey1", value: "labelValue1" }];
    const mockResponse: Response = { detail: "Resource labels updated" };

    service
      .updateResourceLabels(resourceId, location, labels)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${mockApiUrl}/resources/labels`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ id: resourceId, location, labels });
    req.flush(mockResponse);
  });

  it("should add labels to resources", () => {
    const resources = [{ id: "res1", location: "loc1" }];
    const labels: Binding[] = [{ id: "labelKeyAdd", value: "labelValueAdd" }];
    const mockResponse: BulkResponse = { detail: "Labels added", errors: [] };

    service.addLabelsToResources(resources, labels).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/resources/labels`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ resources, labels });
    req.flush(mockResponse);
  });

  it("should remove labels from resources", () => {
    const resources = [{ id: "res1", location: "loc1" }];
    const labelsToRemove: string[] = ["labelKeyRemove"];
    const mockResponse: BulkResponse = { detail: "Labels removed", errors: [] };

    service
      .removeLabelsFromResources(resources, labelsToRemove)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${mockApiUrl}/resources/labels`);
    expect(req.request.method).toBe("DELETE");
    expect(req.request.body).toEqual({ resources, labels: labelsToRemove });
    req.flush(mockResponse);
  });

  it("should upload CSV for labels", () => {
    const dummyFile = new File([""], "test.csv", { type: "text/csv" });
    const cleanLabels = true;
    const mockResponse: UploadResponse = {
      project1: { success: true, value: { lbl1: "val1" } },
    };

    service.uploadCSV(dummyFile, cleanLabels).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${mockApiUrl}/uploads/labels?clean_labels=${cleanLabels}`,
    );
    expect(req.request.method).toBe("POST");
    // Check if the body is FormData (cannot inspect FormData content directly easily in tests)
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockResponse);
  });

  it("should upload CSV for labels (clean_labels=false)", () => {
    const dummyFile = new File([""], "test.csv", { type: "text/csv" });
    const cleanLabels = false;
    const mockResponse: UploadResponse = {
      project1: { success: true, value: { lbl1: "val1" } },
    };

    service.uploadCSV(dummyFile, cleanLabels).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${mockApiUrl}/uploads/labels?clean_labels=${cleanLabels}`,
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockResponse);
  });
});
