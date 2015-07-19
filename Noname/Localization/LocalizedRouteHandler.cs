﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Localization
{
    public class LocalizedRouteHandler : MvcRouteHandler
    {
        protected override System.Web.IHttpHandler GetHttpHandler(System.Web.Routing.RequestContext requestContext)
        {
            var urlLocale = requestContext.RouteData.Values["culture"] as string;
            var cultureName = urlLocale ?? "";

            var cookieLocale = requestContext.HttpContext.Request.Cookies["locale"];
            if (cookieLocale != null)
            {
                if (!cookieLocale.Value.Equals(urlLocale, StringComparison.OrdinalIgnoreCase))
                {
                    var routeValues = requestContext.RouteData.Values;
                    routeValues["culture"] = cookieLocale.Value;

                    var queryString = requestContext.HttpContext.Request.QueryString;
                    foreach (var key in queryString.AllKeys)
                    {
                        if (!routeValues.ContainsKey(key))
                        {
                            routeValues.Add(key, queryString[key]);
                        }
                    }

                    return new RedirectHandler(new UrlHelper(requestContext).RouteUrl(routeValues));
                }
                else
                {
                    cultureName = cookieLocale.Value;
                }
            }

            if (cultureName == "")
            {
                return GetDefaultLocaleRedirectHandler(requestContext);
            }

            try
            {
                var culture = CultureInfo.GetCultureInfo(cultureName);
                Thread.CurrentThread.CurrentCulture = culture;
                Thread.CurrentThread.CurrentUICulture = culture;
            }
            catch (CultureNotFoundException)
            {
                return GetDefaultLocaleRedirectHandler(requestContext);
            }

            if (cookieLocale == null)
            {
                requestContext.HttpContext.Response.AppendCookie(new HttpCookie("locale", cultureName));
            }
            return base.GetHttpHandler(requestContext);
        }

        private static IHttpHandler GetDefaultLocaleRedirectHandler(RequestContext requestContext)
        {
            var uiCulture = CultureInfo.CurrentUICulture;
            var routeValues = requestContext.RouteData.Values;
            routeValues["culture"] = uiCulture.Name;
            return new RedirectHandler(new UrlHelper(requestContext).RouteUrl(routeValues));
        }
    }
}